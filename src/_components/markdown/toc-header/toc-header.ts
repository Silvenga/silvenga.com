import markdownIt, { Options, Renderer, Token } from "markdown-it";

export function tocHeader(md: markdownIt) {

    const inner = md.renderer.rules.tocBody || function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
    };

    // aria-labelled-by would be nice, but I don't have access to the AST before the body is rendered.

    md.renderer.rules.tocBody = function (this: void, tokens: Token[], idx: number, options: Options, env: unknown, self: Renderer) {
        const tocBody = inner(tokens, idx, options, env, self);
        if (tocBody) {
            return `<h2 class="mt-0">Contents</h2>${tocBody}`;
        }
        return tocBody;
    };
}
