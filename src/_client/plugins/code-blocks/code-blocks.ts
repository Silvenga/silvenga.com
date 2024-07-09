import { documentOnLoaded } from "../../on-load";

export function attachCodeBlocks() {
    documentOnLoaded(() => {
        const copyButtons = document.querySelectorAll("[data-for-code-id]");
        for (const button of copyButtons) {
            button.classList.remove("hidden");
        }
    }, { passive: true });
}
