export const dataGistIdKey: string = "data-gist-id";

export class GistHelper {
    public findAndLoadGists(): void {
        let elements: NodeListOf<Element> = document.querySelectorAll(`[${dataGistIdKey}]`);
        for (let element of elements) {
            this.loadGistForElement(element);
        }
    }

    private loadGistForElement(element: Element): void {
        let gistId = element.getAttribute(dataGistIdKey);

        let iframe = document.createElement("iframe");
        iframe.src = `/gist-loader.html#${dataGistIdKey}=${gistId}`;
        iframe.frameBorder = "0";
        iframe.scrolling = "no";
        iframe.className = "s-gist";
        iframe.onload = this.gistLoadedCallback;

        element.parentNode.replaceChild(iframe, element);

        console.log(`Loading gist:`, gistId);
    }

    private gistLoadedCallback(this: HTMLIFrameElement, event: Event): any {
        this.style.height = this.contentWindow.document.body.scrollHeight + "px";
    }
}