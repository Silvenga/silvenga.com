import crypto from "crypto";
import hljs, { HLJSApi, Language } from "highlight.js";
import markdownIt, { } from "markdown-it";
import { unescapeAll } from "markdown-it/lib/common/utils.mjs";
import ReactDOMServer from "react-dom/server";

// Reference: https://github.com/markdown-it/markdown-it/blob/0fe7ccb4b7f30236fb05f623be6924961d296d3d/lib/renderer.mjs#L29-L75

export type FencesOptions = {
    hljs: HLJSApi
}

export function fences(md: markdownIt, { hljs }: FencesOptions) {
    if (md.renderer.rules.fence) {
        const inner = md.renderer.rules.fence;
        md.renderer.rules.fence = (tokens, idx, options, env, self) => {

            const result = inner(tokens, idx, options, env, self);

            const token = tokens[idx]
            const info = token.info ? unescapeAll(token.info).trim() : ""

            if (info) {
                const arr = info.split(/(\s+)/g)
                const langName = arr[0]
                // const langAttrs = arr.slice(2).join("");

                // We have a language, apply custom fence.
                // MarkdownIt basically guarantees a code/pre block will be generated.
                // Just wrap this default generation.
                return ReactDOMServer.renderToStaticMarkup(
                    <Container hljs={hljs} languageId={langName}>
                        {result}
                    </Container>
                )
            }

            return result;
        }
    }
}


type ContainerProps = {
    children: string;
    languageId: string;
    hljs: HLJSApi;
}

function Container({ children, ...props }: ContainerProps) {
    const contentId = getContentId(children);
    const parts: Parts = {
        codeId: `code-${contentId}`,
        labelId: `label-${contentId}`,
    }
    return (
        <section className="code-fence not-prose hljs my-4 rounded overflow-hidden">
            <Header {...props} codeId={contentId} parts={parts} />
            <div id={parts.codeId} aria-labelledby={parts.labelId} dangerouslySetInnerHTML={{ __html: children }} />
        </section>
    )
}

type HeaderProps = {
    languageId: string;
    hljs: HLJSApi;
    codeId: string;
    parts: Parts
}

function Header({ hljs, languageId, parts }: HeaderProps) {
    const language = hljs.getLanguage(languageId);
    return (
        <header className="p-1 capitalize border-b border-b-gray-600 text-white flex">
            <div id={parts.labelId} className="px-3 py-2 me-auto">
                {language?.name ?? languageId} <div className="sr-only">code block</div>
            </div>
            {/* Hidden until JS loads, if it loads */}
            <div className="px-3 py-2 hover:bg-gray-600 rounded active:bg-gray-500 transition-colors hidden"
                data-for-code-id={parts.codeId}
                role="button">
                Copy
            </div>
        </header>
    )
}

function getContentId(code: string) {
    // Used to provide something consistent.
    // Mostly to make the HTML generation deterministic.
    const sha1 = crypto.createHash("sha1");
    sha1.update(code);
    return sha1.digest("base64url");
}

type Parts = {
    codeId: string;
    labelId: string;
}
