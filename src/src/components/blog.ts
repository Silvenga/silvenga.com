import { GistHelper } from "./gists/gist-helper";
import { Piwik } from "./piwik";

export class Blog {

    private _gistHelper: GistHelper;
    private _piwik: Piwik;

    constructor() {
        this._gistHelper = new GistHelper();
        this._piwik = new Piwik();
    }

    public siteLoaded(): void {
        this._piwik.attach();
    }

    public pageLoaded(): void {
        console.log("Page is loaded.");
        this._gistHelper.findAndLoadGists();
    }
}