import LazyLoad from "vanilla-lazyload/dist/lazyload.esm.js";

export class ImageLoader {

    private _lazyLoad = new LazyLoad();

    public attachHandlers(): void {
        this._lazyLoad.update();
    }
}