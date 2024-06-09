declare module "@11ty/eleventy" {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export type UserConfig = any;
}

declare module "@11ty/eleventy-plugin-rss" {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plugin: any;
    export default plugin;
}

declare module "eleventy-plugin-time-to-read" {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plugin: any;
    export default plugin;
}
