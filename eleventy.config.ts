/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { renderToString } from "jsx-async-runtime";
import { UserConfig } from "@11ty/eleventy";

export default function (eleventyConfig: UserConfig) {

    eleventyConfig.addExtension(["11ty.ts", "11ty.tsx"], {
        key: "11ty.js",
    });

    eleventyConfig.addTransform("tsx", async (content: any) => {
        const result = await renderToString(content);
        return `<!doctype html>\n${result}`;
    });

    return {
        dir: {
            input: "src",
            output: ".cache/eleventy",
        },
    };
}
