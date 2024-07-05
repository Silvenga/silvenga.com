/* eslint-disable quotes */

import { HLJSApi } from "highlight.js";
import markdownIt, { } from "markdown-it";
import { unescapeAll } from "markdown-it/lib/common/utils.mjs";

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
                return fenceContainer(langName, result, hljs);
            }

            return result;
        }
    }
}

function fenceContainer(languageId: string, children: string, hljs: HLJSApi) {
    const language = hljs.getLanguage(languageId);
    return `<section class="code-fence not-prose hljs my-4 rounded overflow-hidden">`
        + `<header class="px-4 py-2 capitalize border-b border-b-gray-600 text-white">${language?.name ?? languageId}</header>`
        + children
        + "</section>";
}
