import LazyLoad from "vanilla-lazyload/src/lazyload.js";

export class ImageLoader {

    private _lazyLoad = new LazyLoad();

    public attachHandlers(): void {
        this._lazyLoad.update();
    }
}