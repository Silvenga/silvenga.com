import { attachAnalytics } from "./areas/analytics";

export function main() {

    document.addEventListener("DOMContentLoaded", () => {
        console.log("Ready.")
    });

    attachAnalytics();
}
