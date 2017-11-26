import { GistHelper } from "./gists/gist-helper";

export class Blog {

    private _gistHelper: GistHelper;

    constructor() {
        this._gistHelper = new GistHelper();
    }

    public pageLoaded(): void {
        console.log("Page is loaded.");
        this._gistHelper.findAndLoadGists();
    }
}