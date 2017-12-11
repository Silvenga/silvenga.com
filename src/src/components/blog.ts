import { AjaxLoader } from './ajax-loader';
import { GistHelper } from './gists/gist-helper';
import { LightenseLoader } from './lightense-loader';
import { Piwik } from './piwik';

type PageLoaded = (pageUrl: string, title: string, scrollPosition: number, responseTime: number) => void;
type SiteLoaded = () => void;

export class Blog {

    private _gistHelper: GistHelper;
    private _piwik: Piwik;
    private _ajaxLoader: AjaxLoader;
    private _lightenseLoader: LightenseLoader;

    constructor() {
        this._gistHelper = new GistHelper();
        this._piwik = new Piwik();
        this._ajaxLoader = new AjaxLoader();
        this._lightenseLoader = new LightenseLoader();
    }

    private _onSiteLoaded: SiteLoaded[] = [
        () => console.log("Site is ready."),
        () => this._piwik.attach(),
        () => this._ajaxLoader.loadCompleted((url, title, scrollPosition, responseTime) => this.pageLoaded(url, title, scrollPosition, responseTime)),
        () => this._ajaxLoader.loadCompleted((url, title, scrollPosition) => {
            window.scrollTo(0, scrollPosition)
        })
    ];

    public siteLoaded(): void {
        for (let func of this._onSiteLoaded) {
            func();
        }
    }

    private _onPageLoaded: PageLoaded[] = [
        (url, title, position) => console.log(`Page [${url}: ${title}] is ready.`),
        () => this._gistHelper.findAndLoadGists(),
        () => this._lightenseLoader.attachHandlers(),
        () => this._ajaxLoader.attachHandlers(),
        (url, title, position, responseTime) => this._piwik.trackPageLoad(url, title, responseTime)
    ];

    public pageLoaded(pageUrl: string, title: string, scrollPosition: number, responseTime: number): void {
        for (let func of this._onPageLoaded) {
            func(pageUrl, title, scrollPosition, responseTime);
        }
    }
}