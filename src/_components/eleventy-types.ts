// https://www.11ty.dev/docs/data-eleventy-supplied/

export type PageContext = {
    url: string | false;
    fileSlug: string;
    filePathStem: string;
    date: Date,
    inputPath: string;
    outputPath: string | false;
    outputFileExtension: string;
    templateSyntax: string;
    rawInput: string;
};

export type PageData =
    & {
        content: string;
        layout: string;

        tags?: string[];
        title?: string;
        description?: string;
        author?: string;
        archived?: Date;
        aliases?: string[];
        canonicalUrl?: string;
        refreshUrl?: string;
        type?: string;
        created: Date;
        updated: Date;
    }
    & Record<string, unknown>;

export type Collection = CollectionItem[];

export type CollectionItem = {
    page: PageContext;
    data: PageData;
    rawInput: string;
    content: string;
}

export type EleventyContext = {
    generator: string;
    env: {
        root: string;
        config: string;
        source: string;
        runMode: string;
    } & Record<string, string>;
    directories: Record<string, string | undefined>;
};

export type TemplateContext =
    & {
        eleventy: EleventyContext;
        pkg: Record<string, unknown>;
        page: PageContext,
        collections: {
            all: Collection;
            publicTags: string[] // All non-internal tags.
        } & Record<string, Collection>;
    }
    & PageData
    & {
        site: {
            // Should match "_data/site.json"
            name: string;
            baseUrl: string;
            umami?: {
                endpoint: string;
                websiteId: string;
                domains: string;
            }
        }
    };

export type RenderContext = {
    eleventy: EleventyContext;
    page: PageContext,
    // https://www.11ty.dev/docs/filters/
    url: (path: string) => string;
    slugify: (input: string) => string;
    log: (input: string) => void;
    inputPathToUrl: (inputPath: string) => string;

    // https://github.com/JKC-Codes/eleventy-plugin-time-to-read
    timeToRead: (content: string) => string
};
