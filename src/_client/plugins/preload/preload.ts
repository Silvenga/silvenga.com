import pThrottle from "p-throttle";
import { documentOnLoaded } from "../../on-load";

export function attachPreload() {
    documentOnLoaded(() => {

        // Can likely merge p-throttle and @martinstark/throttle-ts...
        const throttle = pThrottle({
            limit: 8,
            interval: 1000,
            onDelay: () => console.log("Throttling preload..."),
        });

        const preloadLinkThrottled = throttle(preloadLink);

        const links = document.getElementsByTagName("a");
        for (const link of links) {
            if (!link.relList.contains("external")) {
                link.addEventListener("mouseenter", () => {
                    void preloadLinkThrottled(link.href);
                }, { passive: true, once: true });
            }
        }
    });
}

async function preloadLink(link: string) {
    try {
        await fetch(link, {
            method: "GET",
            cache: "force-cache",
            mode: "same-origin"
        })
    } catch (error) {
        console.warn(`Failed while preloading '${link}', error: `, error);
    }
}
