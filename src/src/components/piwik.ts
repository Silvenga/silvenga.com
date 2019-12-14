declare var window: any;

const PiwikHost: string = "https://matomo.silvenga.com/";

export class Piwik {

    public constructor() {
        window._paq = window._paq || [];
    }

    public get eventQueue(): any[] {
        return window._paq;
    }

    public attach() {
        window._paq.push(["enableHeartBeatTimer"]);
        window._paq.push(["enableLinkTracking"]);
        window._paq.push(["setTrackerUrl", PiwikHost + "piwik.php"]);
        window._paq.push(["setSiteId", "1"]);

        let scriptTag = document.createElement("script");
        scriptTag.async = true;
        scriptTag.defer = true; scriptTag.src = PiwikHost + "piwik.js";

        let currentScriptTag = document.getElementsByTagName("script")[0];
        currentScriptTag.parentNode.insertBefore(scriptTag, currentScriptTag);

        window.onscroll = () => this.handleOnScroll();
    }

    public trackPageLoad(url: string, title: string, responseTime: number) {
        this.eventQueue.push(["setCustomUrl", url]);
        this.eventQueue.push(["setDocumentTitle", title]);
        this.eventQueue.push(["setGenerationTimeMs", responseTime]);
        this.eventQueue.push(["trackPageView"]);
    }

    private handleOnScroll() {
        let bottomOfPage = (window.innerHeight + window.pageYOffset) >= document.body.offsetHeight;
        if (bottomOfPage) {
            this.trackEvent("Page", "Scroll", "Bottom");
        }
    }

    private trackEvent(category: string, action: string, name: string = null, value: number = null) {
        let event: Array<string | number> = ["trackEvent", category, action];
        if (name) {
            event.push(name);
            if (value) {
                event.push(value);
            }
        }
        this.eventQueue.push(event);
    }
}