import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItTocDoneRight, { TocOptions } from "markdown-it-toc-done-right";
import { MarkdownItTaskListOptions, tasklist } from "@mdit/plugin-tasklist";

export function buildMarkdownLibrary() {

    let markdownItOptions: markdownIt.Options = {
        html: true, // Allow HTML tags.
        linkify: true
    }

    const markdownItTaskListOptions: MarkdownItTaskListOptions = {

    };

    let markdownItAnchorOptions: markdownItAnchor.AnchorOptions = {
        level: 2,// Start at H2.
        permalink: markdownItAnchor.permalink.linkAfterHeader({
            style: "visually-hidden",
            assistiveText: (title: string) => `Permalink to "${title}"`,
            visuallyHiddenClass: "sr-only",
            class: "absolute top-0 left-[-1rem]",
            wrapper: ["<div class=\"relative ml-[1rem]\">", "</div>"]
        })
    }

    let markdownItTocOptions: Partial<TocOptions> = {
        containerClass: "toc ms-[-2ch] mb-9",
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
        .use(markdownItAnchor, markdownItAnchorOptions)
        .use(markdownItTocDoneRight, markdownItTocOptions);
}

type PrefixDocumentOptions = {
    content: string;
}

function prefixDocument(md: markdownIt, options: PrefixDocumentOptions) {

    const defaultOptions: PrefixDocumentOptions = {
        content: ""
    };

    const opts = Object.assign({}, defaultOptions, options);

    const inner = md.render;
    md.render = (src: string, env: unknown) => {
        const newSrc = `${opts.content}\n\n${src}`;
        return inner.call(md, newSrc, env);
    };
}
