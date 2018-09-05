import { logger } from "./logger";

export class Clipboard {

    public attachCopyEvents() {
        let copyButtons = document.querySelectorAll<HTMLButtonElement>(`button[data-copy-id]`);
        for (let copyButton of copyButtons) {
            let copyId = copyButton.getAttribute("data-copy-id");
            copyButton.onclick = (ev: MouseEvent) => {
                this.copyTarget(copyId);
                this.displayTooltip(copyButton);
            };
        }
    }

    private async displayTooltip(copyButton: HTMLElement) {
        copyButton.blur();
        copyButton.setAttribute("data-tooltip", "Copied!");
        copyButton.classList.add("show");
        await this.delay(500);
        copyButton.classList.remove("show");
        await this.delay(300);
        copyButton.removeAttribute("data-tooltip");
    }

    private copyTarget(copyId: string) {
        let target = document.querySelector(`[data-copy-target="${copyId}"]`);
        let content = target.textContent;
        this.copyText(content);
    }

    private copyText(text: string): boolean {

        // https://stackoverflow.com/a/30810322/2001966
        let textArea = document.createElement("textarea");
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.width = "2em";
        textArea.style.height = "2em";
        textArea.style.padding = "0";
        textArea.style.border = "none";
        textArea.style.outline = "none";
        textArea.style.boxShadow = "none";
        textArea.style.background = "transparent";
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();

        let success = false;
        try {
            let result = document.execCommand("copy");
            success = result;
        } catch (e) {
            logger.warn("Failed to copy:", e);
        }

        document.body.removeChild(textArea);
        return success;
    }

    private async delay(delayMs: number) {
        return new Promise(res => setTimeout(res, delayMs));
    }
}