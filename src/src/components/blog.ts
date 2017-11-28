import { AjaxLoader } from './ajax-loader';
import { GistHelper } from './gists/gist-helper';
import { LightenseLoader } from './lightense-loader';
import { Piwik } from './piwik';

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

    public siteLoaded(): void {
        console.log("Site is ready.");
        this._piwik.attach();
        this._ajaxLoader.loadCompleted(() => this.pageLoaded());
        this._ajaxLoader.loadCompleted((_: string, position: number) => {
            window.scrollTo(0, position)
        });
    }

    public pageLoaded(): void {
        console.log("Page is ready.");
        this._gistHelper.findAndLoadGists();
        this._lightenseLoader.attachHandlers();
        this._ajaxLoader.attachHandlers();
    }
}