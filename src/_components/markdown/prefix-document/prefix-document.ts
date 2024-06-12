import markdownIt from "markdown-it";

type PrefixDocumentOptions = {
    content: string;
}

export function prefixDocument(md: markdownIt, options: PrefixDocumentOptions) {

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
