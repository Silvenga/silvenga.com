declare var window: any;

export class Piwik {

    constructor() {
        window._paq = window._paq || [];
    }

    public get eventQueue(): any[] {
        return window._paq;
    }

    public attach() {
        window._paq.push(['enableHeartBeatTimer']);
        window._paq.push(['enableLinkTracking']);
        (function () {
            var u = "https://piwik.silvenga.com/";
            window._paq.push(['setTrackerUrl', u + 'piwik.php']);
            window._paq.push(['setSiteId', '3']);
            var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
            g.type = 'text/javascript'; g.async = true; g.defer = true; g.src = u + 'piwik.js'; s.parentNode.insertBefore(g, s);
        })();
    }

    public trackPageLoad(url: string, title: string, responseTime: number) {
        this.eventQueue.push(['setCustomUrl', url]);
        this.eventQueue.push(['setDocumentTitle', title]);
        this.eventQueue.push(['setGenerationTimeMs', responseTime]);
        this.eventQueue.push(['trackPageView']);
    }
}