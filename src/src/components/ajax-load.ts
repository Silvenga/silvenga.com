import unfetch from "unfetch";

export class AjaxLoad {
    public attachHandlers(): void {
        var aTags = document.querySelectorAll("a");
        for (let aTag of aTags) {
            this.attachHandler(aTag);
        }
    }

    private attachHandler(aTag: HTMLAnchorElement): void {

        let destro = aTag.getAttribute("href");
        if (!destro.startsWith("/") || aTag.getAttribute("data-ajax-ready") == "true") {
            return;
        }

        aTag.addEventListener("click", this.linkHandlerCallback);
        aTag.setAttribute("data-ajax-ready", "true");
    }

    private linkHandlerCallback(this: HTMLAnchorElement, event: MouseEvent): Promise<void> {

        event.preventDefault();

        function replaceElement(local: Element, remote: Element): void {
            local.parentElement.replaceChild(remote, local);
        }

        function createFragment(text: string): DocumentFragment {
            var template = document.createElement('template');
            template.innerHTML = text;
            let html = template.content;
            return html;
        }

        return new Promise(async () => {
            console.log("Tag hit", this);

            let destro = this.href;

            let response: Response = await unfetch(destro);
            let text = await response.text();
            let remote = createFragment(text);

            let remoteTitle = remote.querySelector("title");
            let remoteAjaxContainer = remote.getElementById("ajax-container");

            let localTitle = document.querySelector("title");
            let localAjaxContainer = document.getElementById("ajax-container");

            replaceElement(localTitle, remoteTitle);
            replaceElement(localAjaxContainer, remoteAjaxContainer);
        });
    }

    private htmlToElement(html: string) {
        // https://stackoverflow.com/a/35385518/2001966
        var template = document.createElement('template');
        template.innerHTML = html;
        return template.content.firstChild;
    }
}