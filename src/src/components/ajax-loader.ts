import unfetch from 'unfetch';
import { Timer } from './timer';

export type OnCompleted = (url: string, title: string, scrollPosition: number, generationTime: number) => void;

export class AjaxLoader {

    private _onCompletedCallbacks: OnCompleted[] = [];

    public attachHandlers(): void {

        let historyApiSupported = window.history != null && window.history.pushState != null;
        if (!historyApiSupported) {
            console.log("History API is not supported. No ajax loading will be used.");
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
        }

        var aTags = document.querySelectorAll("a");
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

    private attachHandler(aTag: HTMLAnchorElement): void {

        let destro = aTag.getAttribute("href");
        if (!destro.startsWith("/") || aTag.getAttribute("data-ajax-ready") == "true") {
            return;
        }

        var _self: AjaxLoader = this;
        aTag.addEventListener("click", function (this: HTMLAnchorElement, event: MouseEvent) {
            _self.linkHandlerCallback(this, event)
        });
        aTag.setAttribute("data-ajax-ready", "true");
    }

    private linkHandlerCallback(element: HTMLAnchorElement, event: MouseEvent): Promise<void> {

        event.preventDefault();
        let remoteUrl = element.href;

        this.saveCurrentState();

        return this.loadRemote(remoteUrl)
            .then(x => {
                history.pushState(new HistoryState(remoteUrl, 0), null, remoteUrl)
            });
    }

    private replaceElement(local: Element, remote: Element): void {
        local.parentElement.replaceChild(remote, local);
    }

    private createFragment(text: string): DocumentFragment {
        var template = document.createElement('template');
        template.innerHTML = text;
        let html = template.content;
        return html;
    }

    public async loadRemote(remoteUrl: string, position: number = 0): Promise<void> {

        console.log(`Ajax navigation to ${remoteUrl} in progress.`);

        let timer = new Timer();
        timer.start();
        let response: Response = await unfetch(remoteUrl);
        let responseTime = timer.stop();
        let text = await response.text();
        let remote = this.createFragment(text);

        let remoteTitle = remote.querySelector("title");
        let remoteDesciption = remote.querySelector('meta[name="description"]');
        let remoteAjaxContainer = remote.getElementById("ajax-container");

        let localTitle = document.querySelector("title");
        let localDesciption = document.querySelector('meta[name="description"]');
        let localAjaxContainer = document.getElementById("ajax-container");

        this.replaceElement(localTitle, remoteTitle);
        this.replaceElement(localDesciption, remoteDesciption);
        this.replaceElement(localAjaxContainer, remoteAjaxContainer);

        let remoteTitleStr = remoteTitle.text;

        this.onLoadCompleted(remoteUrl, remoteTitleStr, position, responseTime);

        console.log(`Ajax navigation completed in ${responseTime}.`);
    }

    private saveCurrentState() {

        let currentPosition = window.pageYOffset;
        let currentPath = window.location.pathname;
        history.replaceState(new HistoryState(currentPath, currentPosition), null);
    }
}

class HistoryState {

    public newLocal: string;

    public position: number;

    constructor(newLocal: string, position: number) {
        this.newLocal = newLocal;
        this.position = position;
    }
}