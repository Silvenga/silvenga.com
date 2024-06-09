/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import timeToRead from "eleventy-plugin-time-to-read";
import { renderToString } from "jsx-async-runtime";
import { DateTime } from "luxon";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import { UserConfig } from "@11ty/eleventy";
import pluginRss from "@11ty/eleventy-plugin-rss";
import { CollectionItem } from "./src/_components/eleventy-types";

export default function (eleventyConfig: UserConfig) {

    eleventyConfig.addPlugin(timeToRead);

    eleventyConfig.addExtension(["11ty.ts", "11ty.tsx"], {
        key: "11ty.js",
    });

    eleventyConfig.addWatchTarget("./src/_components/**/*.{tsx,ts}");

    eleventyConfig.addTransform("tsx", async (content: any) => {
        return (await renderToString(content))
            .replaceAll("className", "class"); // A hack because JSX isn't converting from className to class.
    });

    eleventyConfig.addPassthroughCopy("./src/assets");

    eleventyConfig.addPlugin(pluginRss);

    eleventyConfig.addLayoutAlias("root", "layouts/root.11ty.tsx");
    eleventyConfig.addLayoutAlias("posts", "layouts/posts.11ty.tsx");
    eleventyConfig.addGlobalData("layout", "root");

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

    return {
        dir: {
            input: "src",
            output: ".cache/eleventy"
        }
    };
}
