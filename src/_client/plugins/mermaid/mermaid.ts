import { documentOnLoaded } from "../../on-load";

// TODO a11y?

export function attachMermaid() {
    documentOnLoaded(() => {
        void loadMermaid();
    }, { passive: true });
}

async function loadMermaid() {

    const mermaidAreas = document.getElementsByClassName("mermaid");

    if (mermaidAreas.length > 0) {
        const darkMode = !!window?.matchMedia?.("(prefers-color-scheme:dark)")?.matches;
        console.log(`Activating Mermaid for ${mermaidAreas.length} diagrams (dark: ${darkMode})...`);

        // Manual bundle splitting as Mermaid is freaking huge.
        const mermaidFetch = import("mermaid");
        for (const area of mermaidAreas) {
            activateLoading(area);
        }

        const mermaid = (await mermaidFetch).default;
        mermaid.initialize({
            startOnLoad: false,
            darkMode, // I question if this actually works...
            sequence: {
                mirrorActors: false // Don't duplicate top actors to the bottom.
            },
            theme: "neutral",
            fontFamily: "Inter Variable",
            altFontFamily: "Inter Regular"
        });
        console.log("Mermaid ready, rendering...");

        for (const area of mermaidAreas) {
            await renderDiagram(area, mermaid);
        }

        console.log("All Mermaid diagrams are ready.");
    }
}

function activateLoading(area: Element) {
    for (const loading of area.getElementsByClassName("mermaid-loading")) {
        if (loading instanceof HTMLElement) {
            loading.style.display = "inline-flex";
        }
    }
}

async function renderDiagram(area: Element, mermaid: typeof import("mermaid").default) {
    for (const diagram of area.getElementsByClassName("mermaid-diagram")) {
        if (diagram instanceof HTMLElement) {
            await mermaid.run({
                nodes: [diagram]
            })
            diagram.style.display = "inline-flex";
        }
    }
    for (const loading of area.getElementsByClassName("mermaid-loading")) {
        if (loading instanceof HTMLElement) {
            loading.style.display = "";
        }
    }
}
