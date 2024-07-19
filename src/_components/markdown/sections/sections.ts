import markdownIt, { StateCore } from "markdown-it";
import Token from "markdown-it/lib/token.mjs";

export function sections(md: markdownIt) {
    md.core.ruler.push("sections", addSections);
}

function addSections(state: StateCore): void {
    const tokens = [];
    let inSection = false;
    for (const token of state.tokens) {
        if (token.type == "heading_open") {
            if (inSection) {
                tokens.push(closeSection());
                inSection = false;
            }
            if (!inSection) {
                tokens.push(openSection());
                inSection = true;
            }
        }
        tokens.push(token);
    }
    if (inSection) {
        tokens.push(closeSection());
    }
    state.tokens = tokens;
}

function openSection() {
    const sectionOpen = new Token("section_open", "section", 1);
    sectionOpen.block = true;
    return sectionOpen;
}

function closeSection() {
    const sectionClose = new Token("section_close", "section", -1);
    sectionClose.block = true;
    return sectionClose;
}
