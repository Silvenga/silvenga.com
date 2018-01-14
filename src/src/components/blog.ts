import { Clipboard } from "./clipboard";
import { AjaxLoader } from "./ajax-loader";
import { GistHelper } from "./gists/gist-helper";
import { LightenseLoader } from "./lightense-loader";
import { Piwik } from "./piwik";
import { logger } from "./logger";

type PageLoaded = (pageUrl: string, title: string, scrollPosition: number, responseTime: number) => void;
type SiteLoaded = () => void;

export class Blog {

    private _gistHelper: GistHelper = new GistHelper();
    private _piwik: Piwik = new Piwik();
    private _ajaxLoader: AjaxLoader = new AjaxLoader();
    private _lightenseLoader: LightenseLoader = new LightenseLoader();
    private _clipboard: Clipboard = new Clipboard();

    private _onSiteLoaded: SiteLoaded[] = [
        () => logger.info("Site is ready."),
        () => this._ajaxLoader.attachGlobalHandlers(),
        () => this._piwik.attach(),
        () => this._ajaxLoader.loadCompleted((url, title, scrollPosition, responseTime) => this.pageLoaded(url, title, scrollPosition, responseTime)),
        () => this._ajaxLoader.loadCompleted((url, title, scrollPosition) => {
            window.scrollTo(0, scrollPosition);
        })
    ];

    public siteLoaded(): void {
        for (let func of this._onSiteLoaded) {
            func();
        }
    }

    private _onPageLoaded: PageLoaded[] = [
        (url, title, position) => logger.info(`Page [${url}] - [${title}] is ready.`),
        () => this._gistHelper.findAndLoadGists(),
        () => this._lightenseLoader.attachHandlers(),
        () => this._ajaxLoader.attachHandlers(),
        () => this._clipboard.attachCopyEvents(),
        (url, title, position, responseTime) => this._piwik.trackPageLoad(url, title, responseTime)
    ];

    public pageLoaded(pageUrl: string, title: string, scrollPosition: number, responseTime: number): void {
        for (let func of this._onPageLoaded) {
            func(pageUrl, title, scrollPosition, responseTime);
        }
    }
}