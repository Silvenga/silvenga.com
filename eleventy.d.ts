/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "@11ty/eleventy" {
    export type UserConfig = any;
    export const InputPathToUrlTransformPlugin: any;

    export type CollectionApi = {

        /**
         * https://www.11ty.dev/docs/collections/#getall()
         * @returns
         */
        getAll: <T>() => T[];

        /**
         * https://www.11ty.dev/docs/collections/#getallsorted()
         * @returns
         */
        getAllSorted: <T>() => T[];

        /**
         * https://www.11ty.dev/docs/collections/#getfilteredbytag(-tagname-)
         * @param tagName
         * @returns
         */
        getFilteredByTag: <T>(tagName: string) => T[];

        /**
         * https://www.11ty.dev/docs/collections/#getfilteredbytags(-tagname-secondtagname-[...]-)
         * @param tagNames
         * @returns
         */
        getFilteredByTags: <T>(...tagNames: string[]) => T[];

        /**
         * https://www.11ty.dev/docs/collections/#getfilteredbyglob(-glob-)
         * @param glob
         * @returns
         */
        getFilteredByGlob: <T>(glob: string | string[]) => T[];
    }
}

declare module "@11ty/eleventy-plugin-rss" {
    const plugin: any;
    export default plugin;
}

declare module "eleventy-plugin-time-to-read" {
    const plugin: any;
    export default plugin;
}

declare module "tailwind-highlightjs" {
    const plugin: any;
    export default plugin;
}
