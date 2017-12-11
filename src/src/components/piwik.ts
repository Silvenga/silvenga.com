declare var window: any;

const PiwikHost: string = "https://piwik.silvenga.com/";

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
        window._paq.push(['setTrackerUrl', PiwikHost + 'piwik.php']);
        window._paq.push(['setSiteId', '3']);

        let scriptTag = document.createElement('script')
        scriptTag.async = true;
        scriptTag.defer = true; scriptTag.src = PiwikHost + 'piwik.js';

        let currentScriptTag = document.getElementsByTagName('script')[0];
        currentScriptTag.parentNode.insertBefore(scriptTag, currentScriptTag);
    }

    public trackPageLoad(url: string, title: string, responseTime: number) {
        this.eventQueue.push(['setCustomUrl', url]);
        this.eventQueue.push(['setDocumentTitle', title]);
        this.eventQueue.push(['setGenerationTimeMs', responseTime]);
        this.eventQueue.push(['trackPageView']);
    }
}