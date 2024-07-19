import hljs from "highlight.js"
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItHighlightjs from "markdown-it-highlightjs";
import { HighlightOptions } from "markdown-it-highlightjs/types/core";
import markdownItImageFigures from "markdown-it-image-figures";
import markdownItTocDoneRight, { TocOptions } from "markdown-it-toc-done-right";
import { MarkdownItTaskListOptions, tasklist } from "@mdit/plugin-tasklist";
import { fences } from "./fences/fences";
import { hljsFencePlugin } from "./hljs-fence/hljs-fence";
import { ImageClassesOptions, imageClasses } from "./image-classes/image-classes";
import { prefixDocument } from "./prefix-document/prefix-document";
import { sections } from "./sections/sections";
import { tocHeader } from "./toc-header/toc-header";

export function buildMarkdownLibrary() {

    const markdownItOptions: markdownIt.Options = {
        html: true, // Allow HTML tags.
        linkify: true
    }

    const markdownItTaskListOptions: MarkdownItTaskListOptions = {};

    hljs.addPlugin(hljsFencePlugin);
    const highlightOptions: HighlightOptions = {
        hljs: hljs
    };

    const imageClassesOptions: ImageClassesOptions = {
        classes: ["lightbox-subject"]
    };
    const markdownItImageFiguresOptions = {
        figcaption: "title"
    };

    const markdownItAnchorOptions: markdownItAnchor.AnchorOptions = {
        level: 2,// Start at H2.
        permalink: markdownItAnchor.permalink.headerLink({
            class: "header-anchor not-prose"
        })
    };

    const markdownItTocOptions: Partial<TocOptions> = {
        containerClass: "toc",
        listClass: "toc-list",
        itemClass: "toc-item",
        linkClass: "toc-link",
        format: (label) => {
            return `<div class="toc-label">${label}</div>`
        }
    };

    return markdownIt(markdownItOptions)
        .use(prefixDocument, { content: "[[toc]]" })
        .use(tasklist, markdownItTaskListOptions)
        .use(markdownItHighlightjs, highlightOptions)
        .use(fences, { hljs })
        .use(imageClasses, imageClassesOptions)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .use(markdownItImageFigures, markdownItImageFiguresOptions)
        .use(markdownItAnchor, markdownItAnchorOptions)

        // Incorrect typings referencing a different markdownItToc.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .use(markdownItTocDoneRight, markdownItTocOptions)
        .use(tocHeader)
        .use(sections);
}

