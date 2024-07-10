import { attachAnalytics } from "./plugins/analytics/analytics";
import { attachCodeBlocks } from "./plugins/code-blocks/code-blocks";
import { attachLightBox } from "./plugins/lightbox/lightbox";
import { attachPreload } from "./plugins/preload/preload";

export function main() {

    document.addEventListener("DOMContentLoaded", () => {
        console.log("Ready.")
    });

    attachAnalytics();
    attachLightBox();
    attachCodeBlocks();
    attachPreload();
}
