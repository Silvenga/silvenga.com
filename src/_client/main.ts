import { documentOnLoaded } from "./on-load";
import { attachAnalytics } from "./plugins/analytics/analytics";
import { attachCodeBlocks } from "./plugins/code-blocks/code-blocks";
import { attachLightBox } from "./plugins/lightbox/lightbox";
import { attachMermaid } from "./plugins/mermaid/mermaid";
import { attachPreload } from "./plugins/preload/preload";
import { attachThemeToggle } from "./plugins/theme-toggle/theme-toggle";
import { attachTocScrollSpy } from "./plugins/toc-scroll-spy/toc-scroll-spy";

export function main() {
    attachAnalytics();
    attachLightBox();
    attachCodeBlocks();
    attachPreload();
    attachTocScrollSpy();
    attachMermaid();
    attachThemeToggle();

    documentOnLoaded(() => {
        console.log("Ready.")
    });
}
