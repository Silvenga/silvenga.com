import markdownIt, { } from "markdown-it";
import { unescapeAll } from "markdown-it/lib/common/utils.mjs";
import ReactDOMServer from "react-dom/server";

export function mermaid(md: markdownIt) {
    if (md.renderer.rules.fence) {
        const inner = md.renderer.rules.fence;
        md.renderer.rules.fence = (tokens, idx, options, env, self) => {
            const token = tokens[idx]
            const info = token.info ? unescapeAll(token.info).trim() : ""
            if (info == "mermaid") {
                return ReactDOMServer.renderToStaticMarkup(
                    <div className="mermaid lightbox-subject not-prose h-96 w-full my-6 rounded-md bg-white dark:bg-gray-50 relative border border-gray-200 pointer-events-auto">
                        {/* pointer-events-none to avoid absolute nodes from eating click events */}
                        <pre className="mermaid-diagram opacity-0 absolute w-full h-full flex justify-center px-3 p-6 pointer-events-none select-none">{token.content.trim()}</pre>
                        <div className="mermaid-loading opacity-0 absolute w-full h-full flex justify-center items-center p-3 pointer-events-none">
                            <div className="font-medium text-gray-400" role="status">
                                Rendering Diagram...
                            </div>
                        </div>
                        <noscript>
                            <div className="absolute w-full h-full flex justify-center items-center text-center p-3 pointer-events-none">
                                <div className="font-medium text-black">
                                    This is a Mermaid interactive diagram that requires JavaScript to be enabled.
                                </div>
                            </div>
                        </noscript>
                    </div>
                )
            } else {
                return inner(tokens, idx, options, env, self);
            }
        }
    }
}
