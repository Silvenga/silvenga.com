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
        tags?: string[];
        title?: string;
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
    & {
        content: string;
        layout: string;
        title?: string;
        description?: string;
        tags: string[] | undefined;
        author?: string;
        archived?: Date;
    }
    & {
        site: {
            name: string;
            baseUrl: string;
            defaultAuthor: string;
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
