import crypto from "crypto";
import { HLJSApi } from "highlight.js";
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
                const arr = info.split(/(\s+)/g, 2)
                const languageId = arr[0]
                const attributes = arr.length > 1
                    ? arr[1].split(",").map<Attribute>(attr => {
                        const parts = attr.split("=", 2);
                        return {
                            name: parts[0].trim(),
                            value: parts.length > 1 ? parts[1].trim() : undefined
                        };
                    })
                    : [];

                // We have a language, apply custom fence.
                // MarkdownIt basically guarantees a code/pre block will be generated.
                // Just wrap this default generation.
                return ReactDOMServer.renderToStaticMarkup(
                    <Container hljs={hljs} languageId={languageId} attributes={attributes}>
                        {result}
                    </Container>
                )
            }
            return result;
        }
    }
}

// Feedback:
// - Hide line numbers to screen readers. (I don't like line numbers away, not adding).
// - Provide a skip link, exposed to screen readers, to skip over the code block.
// - No point in providing information that non-screen readers don't see.
// - Provide a copy button that does not modify focus that copies the text to the clipboard - allowing users to copy into their editor.

type ContainerProps = {
    children: string;
    languageId: string;
    attributes: Attribute[];
    hljs: HLJSApi;
}

function Container({ children, ...props }: ContainerProps) {
    const contentId = getContentId(children);
    const parts: Parts = {
        codeId: `code-${contentId}`,
        skipId: `skip-${contentId}`,
    }
    return (
        <>
            <figure className="code-fence not-prose hljs my-4 rounded overflow-hidden">
                <Header {...props} codeId={contentId} parts={parts} />
                <div id={parts.codeId} dangerouslySetInnerHTML={{ __html: children }} />
            </figure>
            <div id={parts.skipId} />
        </>
    );
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
        <figcaption className="p-1 capitalize border-b border-b-gray-600 text-white flex">
            <div className="px-3 py-1 me-auto">
                {language?.name ?? languageId} <div className="sr-only">code block</div>
            </div>
            <a href={`#${parts.skipId}`} className="sr-only">Skip</a>
            {/* Hidden until JS loads, if it loads */}
            <button className="px-2 py-1 hover:bg-gray-600 rounded active:bg-gray-500 transition-colors"
                style={{ visibility: "hidden" }}
                data-for-code-id={parts.codeId}>
                Copy
            </button>
        </figcaption>
    );
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
    skipId: string;
}

type Attribute = {
    name: string;
    value?: string;
}
