import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import { HighlightOptions } from "markdown-it-highlightjs/types/core";
import markdownItHighlightjs from "markdown-it-image-figures";
import markdownItImageFigures from "markdown-it-image-figures";
import markdownItTocDoneRight, { TocOptions } from "markdown-it-toc-done-right";
import { MarkdownItTaskListOptions, tasklist } from "@mdit/plugin-tasklist";
import { ImageClassesOptions, imageClasses } from "./image-classes/image-classes";
import { prefixDocument } from "./prefix-document/prefix-document";
import { tocHeader } from "./toc-header/toc-header";

export function buildMarkdownLibrary() {

    const markdownItOptions: markdownIt.Options = {
        html: true, // Allow HTML tags.
        linkify: true
    }

    const markdownItTaskListOptions: MarkdownItTaskListOptions = {};
    const highlightOptions: HighlightOptions = {};

    const imageClassesOptions: ImageClassesOptions = {
        classes: ["lightbox-subject"]
    }
    const markdownItImageFiguresOptions = {
        figcaption: true
    }

    const markdownItAnchorOptions: markdownItAnchor.AnchorOptions = {
        level: 2,// Start at H2.
        permalink: markdownItAnchor.permalink.headerLink({
            class: "header-anchor not-prose"
        })
    };

    const markdownItTocOptions: Partial<TocOptions> = {
        containerClass: "toc",
        listClass: "list list-none p-0 ps-[2ch]",
        itemClass: "item p-0",
        linkClass: "no-underline hover:underline text-lg flex items-center",
        format: (label) => {
            return `<span class="link-icon h-[16px] w-[16px] block mr-2" aria-hidden></span> ${label}`
        }
    };

    return markdownIt(markdownItOptions)
        .use(prefixDocument, { content: "[[toc]]" })
        .use(tasklist, markdownItTaskListOptions)
        .use(markdownItHighlightjs, highlightOptions)
        .use(imageClasses, imageClassesOptions)
        .use(markdownItImageFigures, markdownItImageFiguresOptions)
        .use(markdownItAnchor, markdownItAnchorOptions)

        // Incorrect typings referencing a different markdownItToc.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        .use(markdownItTocDoneRight, markdownItTocOptions)
        .use(tocHeader);
}

