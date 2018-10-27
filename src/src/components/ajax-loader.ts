import unfetch from "unfetch";
import { Timer } from "./timer";
import { logger } from "./logger";

export type OnCompleted = (url: string, title: string, scrollPosition: number, generationTime: number) => void;

export class AjaxLoader {

    private _onCompletedCallbacks: OnCompleted[] = [];

    public attachGlobalHandlers(): void {

        if (!this.supported) {
            logger.info("History API is not supported. No ajax loading will be used.");
            return;
        }

        window.onpopstate = (event: PopStateEvent) => {

            let state = event.state as HistoryState;
            let newLocal: string;
            let newPosition: number;
            if (state != null && state.newLocal != null) {
                newLocal = state.newLocal;
                newPosition = state.position;
            } else {
                let newWindow = event.currentTarget as Window;
                newLocal = newWindow.location.pathname;
                newPosition = 0;
            }
            this.loadRemote(newLocal, newPosition);
        };

        this.addStyles();
    }

    public attachHandlers(): void {

        if (!this.supported) {
            return;
        }

        let aTags = document.querySelectorAll("a");
        for (let aTag of aTags) {
            this.attachHandler(aTag);
        }
    }

    public loadCompleted(callback: OnCompleted) {
        this._onCompletedCallbacks.push(callback);
    }

    private onLoadCompleted(newUrl: string, newTitle: string, scrollPosition: number, generationTime: number) {
        for (let callback of this._onCompletedCallbacks) {
            callback(newUrl, newTitle, scrollPosition, generationTime);
        }
    }

    public get supported() {
        return window.history != null && window.history.pushState != null;
    }

    private attachHandler(aTag: HTMLAnchorElement): void {

        let destro = aTag.getAttribute("href");
        if (!destro.startsWith("/") || aTag.getAttribute("data-ajax-ready") == "true") {
            return;
        }

        let self: AjaxLoader = this;
        aTag.addEventListener("click", function (this: HTMLAnchorElement, event: MouseEvent) {
            self.linkHandlerCallback(this, event);
        });
        aTag.setAttribute("data-ajax-ready", "true");
    }

    private async linkHandlerCallback(element: HTMLAnchorElement, event: MouseEvent): Promise<void> {

        event.preventDefault();
        let remoteUrl = element.href;

        this.saveCurrentState();

        await this.loadRemote(remoteUrl);
        history.pushState(new HistoryState(remoteUrl, 0), null, remoteUrl);
    }

    private createFragment(text: string): DocumentFragment {
        let template = document.createElement("template");
        template.innerHTML = text;
        let html = template.content;
        return html;
    }

    public async loadRemote(remoteUrl: string, position: number = 0): Promise<void> {

        logger.info(`Ajax navigation to ${remoteUrl} in progress.`);

        let timer = new Timer();
        timer.start();
        this.startLoading();
        let response: Response = await unfetch(remoteUrl);
        this.stopLoading();
        let responseTime = timer.stop();
        let text = await response.text();
        let remote = this.createFragment(text);

        this.copyElementTo(x => x.querySelector("title"), document, remote);
        this.copyElementTo(x => x.querySelector('meta[name="description"]'), document, remote);
        this.copyElementTo(x => x.getElementById("ajax-container"), document, remote);

        let remoteTitleStr = document.querySelector("title").text;
        this.onLoadCompleted(remoteUrl, remoteTitleStr, position, responseTime);

        logger.info(`Ajax navigation completed in ${responseTime.toFixed(2)}ms.`);
    }

    private copyElementTo(selector: (doc: DocumentFragment) => HTMLElement, local: DocumentFragment, remote: DocumentFragment) {
        let remoteElement = selector(remote);
        let localElement = selector(local);
        this.replaceElement(localElement, remoteElement);
    }

    private replaceElement(local: Element, remote: Element): void {
        local.parentElement.replaceChild(remote, local);
    }

    private saveCurrentState() {

        let currentPosition = window.pageYOffset;
        let currentPath = window.location.pathname;
        history.replaceState(new HistoryState(currentPath, currentPosition), null);
    }

    private addStyles() {

        const styleText = `
            .s-nav#loading-bar.loading::after {
                width: 100%;
                border-width: 1px;
            }
        `;

        let styleTag = document.createElement("style");
        styleTag.appendChild(document.createTextNode(styleText));

        document.head.appendChild(styleTag);
    }

    private startLoading() {
        let loadingBar = document.getElementById("loading-bar");
        loadingBar.classList.add("loading");
    }

    private stopLoading() {
        let loadingBar = document.getElementById("loading-bar");
        loadingBar.classList.remove("loading");
    }
}

class HistoryState {

    public newLocal: string;

    public position: number;

    public constructor(newLocal: string, position: number) {
        this.newLocal = newLocal;
        this.position = position;
    }
}