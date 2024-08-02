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
                    <div className="mermaid not-prose h-96 w-full my-6 rounded-md dark:bg-gray-50 relative">
                        <pre className="mermaid-diagram hidden justify-center w-full h-full px-3 p-6">{token.content.trim()}</pre>
                        <div className="mermaid-loading hidden absolute w-full h-full justify-center items-center p-3">
                            <div className="font-medium text-gray-400">
                                Rendering Diagram...
                            </div>
                        </div>
                        <noscript>
                            <div className="absolute w-full h-full flex justify-center items-center text-center p-3">
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
