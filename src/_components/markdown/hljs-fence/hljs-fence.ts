import { HLJSPlugin } from "highlight.js";

export const hljsFencePlugin: HLJSPlugin = {
    "before:highlight": (context) => {
        // Avoid the extra new line making weird padding.
        context.code = context.code.trim();
    }
}
