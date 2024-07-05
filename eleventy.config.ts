import timeToRead from "eleventy-plugin-time-to-read";
import { renderToStaticMarkup } from "react-dom/server";
import { CollectionApi, UserConfig } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import pluginRss from "@11ty/eleventy-plugin-rss";
import { CollectionItem } from "./src/_components/eleventy-types";
import { buildMarkdownLibrary } from "./src/_components/markdown/builder";
import { redirectsCollectionFactory } from "./src/_components/redirects-collection";
import { formatAsRfc822Date } from "./src/_components/utilities/rfc822-date";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

export default function (eleventyConfig: UserConfig) {

    eleventyConfig.setLibrary("md", buildMarkdownLibrary())

    // Plugins
    // const { InputPathToUrlTransformPlugin } = await import("@11ty/eleventy");
    // eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
    eleventyConfig.addPlugin(timeToRead);
    eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
        extensions: "html",
        formats: ["webp"],
        defaultAttributes: {
            loading: "lazy",
            decoding: "async",
        },
        urlPath: "/img/"
    });
    eleventyConfig.addPlugin(pluginRss);

    // TSX support.
    eleventyConfig.addExtension(["11ty.jsx", "11ty.ts", "11ty.tsx"], {
        key: "11ty.js",
        compile: function () {
            return async function (this: any, data: any) {
                const content = await this.defaultRenderer(data);
                return renderToStaticMarkup(content);
            };
        },
    });
    eleventyConfig.addTemplateFormats("11ty.ts,11ty.tsx")

    // Defaults
    eleventyConfig.addLayoutAlias("root", "layouts/root.11ty.tsx");
    eleventyConfig.addLayoutAlias("posts", "layouts/posts.11ty.tsx");

    // Used by the sitemap.
    eleventyConfig.addFilter("dateToIso", (dateString: string) => {
        return new Date(dateString).toISOString()
    });

    // Used by RSS
    eleventyConfig.addShortcode("nowRfc822", () => {
        return formatAsRfc822Date(new Date());
    });

    // Used to detect which tags are actually valid tags (aka, not a hidden collection).
    eleventyConfig.addCollection("publicTags", publicTagsCollectionFactory);

    // Used for redirects.
    eleventyConfig.addCollection("redirects", redirectsCollectionFactory);

    // Global Data
    eleventyConfig.addGlobalData("layout", "root");

    eleventyConfig.addGlobalData(
        "eleventyComputed.noIndex",
        function () {
            return (data: Record<string, unknown>) => {
                // Only hide drafts.
                if (data.draft) {
                    return true;
                }
                return data.noIndex;
            };
        }
    );

    return {
        dir: {
            input: "src",
            output: ".cache/eleventy"
        }
    };
}

function publicTagsCollectionFactory(collectionApi: CollectionApi) {
    const tagSet = new Set();
    collectionApi.getAll<CollectionItem>().forEach(item => {
        if ("tags" in item.data) {
            let tags = item.data.tags ?? [];

            tags = tags.filter(itemTag => {
                switch (itemTag) {
                    case "all":
                    case "nav":
                    case "post":
                    case "posts":
                        return false;
                    default:
                        return true;
                }
            });

            for (const tag of tags) {
                tagSet.add(tag);
            }
        }
    });

    return [...tagSet];
}
