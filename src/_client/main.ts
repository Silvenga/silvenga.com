import { attachAnalytics } from "./plugins/analytics/analytics";
import { attachLightBox } from "./plugins/lightbox/lightbox";

export function main() {

    document.addEventListener("DOMContentLoaded", () => {
        console.log("Ready.")
    });

    attachAnalytics();
    attachLightBox();
}
