/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "@11ty/eleventy" {
    export type UserConfig = any;
    export const InputPathToUrlTransformPlugin: any;
}

declare module "@11ty/eleventy-plugin-rss" {
    const plugin: any;
    export default plugin;
}

declare module "eleventy-plugin-time-to-read" {
    const plugin: any;
    export default plugin;
}
