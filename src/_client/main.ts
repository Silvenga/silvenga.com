import { documentOnLoaded } from "./on-load";
import { attachAnalytics } from "./plugins/analytics/analytics";
import { attachCodeBlocks } from "./plugins/code-blocks/code-blocks";
import { attachLightBox } from "./plugins/lightbox/lightbox";
import { attachMermaid } from "./plugins/mermaid/mermaid";
import { attachPreload } from "./plugins/preload/preload";
import { attachTocScrollSpy } from "./toc-scroll-spy/toc-scroll-spy";

export function main() {
    attachAnalytics();
    attachLightBox();
    attachCodeBlocks();
    attachPreload();
    attachTocScrollSpy();
    attachMermaid();

    documentOnLoaded(() => {
        console.log("Ready.")
    });
}
