import HtmlParser from "node-html-parser";

export function extractToc(content: string): ExtractionResult {
    if (!HtmlParser.valid(content)) {
        throw new Error("Failed to extract TOC, content appears invalid.");
    }
    const tree = HtmlParser.parse(content);
    const toc = tree.querySelector(".toc");
    if (!toc) {
        return { result: "NoToc" };
    }

    // If the TOC node is empty, assume no TOC.
    if (!toc.childNodes.length) {
        return { result: "NoToc" };
    }

    toc.remove();

    return {
        result: "HasToc",
        tocTree: toc.outerHTML,
        remainingTree: tree.outerHTML
    };
}

type ExtractionResult =
    | { result: "HasToc", remainingTree: string, tocTree: string }
    | { result: "NoToc" }
