import { GistHelper } from "./gists/gist-helper";
import { Piwik } from "./piwik";
import Lightense from "lightense-images";
import unfetch from "unfetch";
import { AjaxLoad } from "./ajax-load";

export class Blog {

    private _gistHelper: GistHelper;
    private _piwik: Piwik;
    private _ajaxLoad: AjaxLoad;

    constructor() {
        this._gistHelper = new GistHelper();
        this._piwik = new Piwik();
        this._ajaxLoad = new AjaxLoad();
    }

    public siteLoaded(): void {
        this._piwik.attach();
    }

    public pageLoaded(): void {
        console.log("Page is loaded.");
        this._gistHelper.findAndLoadGists();
        this.attachLightense();
        // this._ajaxLoad.attachHandlers();
    }

    private attachLightense() {
        let images = document.querySelectorAll(".s-article img");
        for (let image of images) {
            image.setAttribute("data-background", "rgba(255, 255, 255, 0.6)")
        }
        Lightense(images);
    }

    private attachAjaxLoad() {

        fetch('/foo.json')
            .then(r => r.json())
            .then(data => {
                console.log(data);
            });
    }
}