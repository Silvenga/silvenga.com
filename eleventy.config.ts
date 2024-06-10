/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import timeToRead from "eleventy-plugin-time-to-read";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import { renderToStaticMarkup } from "react-dom/server";
import { UserConfig } from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import pluginRss from "@11ty/eleventy-plugin-rss";
import { CollectionItem } from "./src/_components/eleventy-types";

export default async function (eleventyConfig: UserConfig) {

    // Plugins
    const { InputPathToUrlTransformPlugin } = await import("@11ty/eleventy");
    eleventyConfig.addPlugin(InputPathToUrlTransformPlugin);
    eleventyConfig.addPlugin(timeToRead);
    eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
        extensions: "html",
        formats: ["webp"],
        urlPath: null,
        defaultAttributes: {
            loading: "lazy",
            decoding: "async",
        },
    });
    eleventyConfig.addPlugin(pluginRss);

    // TSX support.
    eleventyConfig.addExtension(["11ty.jsx", "11ty.ts", "11ty.tsx"], {
        key: "11ty.js",
        compile: function () {
            return async function (this: any, data: any) {
                let content = await this.defaultRenderer(data);
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

    // Used to detect which tags are actually valid tags (aka, not a hidden collection).
    eleventyConfig.addCollection("publicTags", function (collectionApi: any) {
        let tagSet = new Set();
        collectionApi.getAll().forEach(function (item: CollectionItem) {
            if ("tags" in item.data) {
                let tags = item.data.tags ?? [];

                tags = tags.filter(function (item) {
                    switch (item) {
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
    });

    let markdownItOptions: markdownIt.Options = {
        html: true, // Allow HTML tags.
        linkify: true
    }

    let markdownItAnchorOptions: markdownItAnchor.AnchorOptions = {
        level: 2,// Start at H2.
        permalink: markdownItAnchor.permalink.linkAfterHeader({
            style: "visually-hidden",
            assistiveText: (title: string) => `Permalink to "${title}"`,
            visuallyHiddenClass: "hidden",
            class: "absolute top-0 left-[-1rem]",
            placement: "before",
            wrapper: ["<div class=\"relative ml-[1rem]\">", "</div>"]
        })
    }

    eleventyConfig.setLibrary("md", markdownIt(markdownItOptions).use(markdownItAnchor, markdownItAnchorOptions))

    // Global Data
    eleventyConfig.addGlobalData("layout", "root");

    eleventyConfig.addGlobalData(
        "eleventyComputed.eleventyExcludeFromCollections",
        function () {
            return (data: Record<string, unknown>) => {
                // Hide drafts.
                if (data.draft) {
                    return true;
                }
                // Hide archived.
                if (data.archived) {
                    return true;
                }

                return data.eleventyExcludeFromCollections;
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
