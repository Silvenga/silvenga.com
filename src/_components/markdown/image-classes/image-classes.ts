import markdownIt, { Options, Renderer, Token } from "markdown-it";

export type ImageClassesOptions = {
    classes?: string[];
}

export function imageClasses(md: markdownIt, options: ImageClassesOptions) {

    const defaultOptions: ImageClassesOptions = {
        classes: []
    };

    const opts = Object.assign({}, defaultOptions, options);

    const inner = md.renderer.rules.image || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    md.renderer.rules.image = function (this: void, tokens: Token[], idx: number, options: Options, env: unknown, self: Renderer) {
        if (opts.classes && opts.classes.length) {
            tokens[idx].attrSet("class", opts.classes.join(" "));
        }
        return inner(tokens, idx, options, env, self);
    };
}
