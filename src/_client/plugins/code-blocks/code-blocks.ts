import { documentOnLoaded } from "../../on-load";
import { dispatchCustomAction } from "../analytics/custom-actions";

export function attachCodeBlocks() {
    documentOnLoaded(() => {
        const copyButtons = document.querySelectorAll("[data-for-code-id]");
        for (const button of copyButtons) {
            if (button instanceof HTMLElement) {
                button.addEventListener("click", () => {
                    void onCopyClick(button);
                });
                button.style.visibility = ""; // Unhide the button, since JS can load.
            }
        }
    }, { passive: true });
}

async function onCopyClick(button: HTMLElement) {
    const codeId = button.dataset.forCodeId;
    if (codeId) {
        const codeBlock = document.getElementById(codeId);
        const text = codeBlock?.textContent
        if (text) {
            const success = await copyToClipboard(text);
            if (success) {
                showCopiedTooltip(button);
            }

            dispatchCustomAction(button, {
                name: "code-copied",
                data: {
                    success,
                    page: `${window.location.pathname}#${codeId}`
                }
            });
        }
    }
}

async function copyToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (e) {
        console.warn("Failed to copy text to the clipboard, error: ", e);
        return false;
    }
}

function showCopiedTooltip(button: HTMLElement) {
    const originalLabel = button.ariaLabel;

    // Open
    button.ariaLabel = "Copied";
    button.dataset.showCopied = "true";

    // Close
    setTimeout(() => {
        button.ariaLabel = originalLabel;
        delete button.dataset.showCopied;
    }, 2_000);
}
