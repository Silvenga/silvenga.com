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

export type PageData = Record<string, unknown>;

export type CollectionItem = {
    page: PageContext;
    data: PageData;
    rawInput: string;
    content: string;
}

export type TemplateContext = {
    eleventy: {
        generator: string;
        env: {
            root: string;
            config: string;
            source: string;
            runMode: string;
        } & Record<string, string>;
        directories: Record<string, string | undefined>;
    };
    pkg: Record<string, unknown>;
    page: PageContext,
    collections: {
        all: CollectionItem[];
    } & Record<string, CollectionItem[]>;
}

export type LayoutContext =
    & TemplateContext
    & {
        content: string;
        layout: string;
    };
