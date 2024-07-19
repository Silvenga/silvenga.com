import { documentOnLoaded } from "../on-load";

export function attachTocScrollSpy() {
    documentOnLoaded(() => {
        const toc = document.getElementById("toc-block");
        if (toc) {
            const references: TocReference[] = [];
            for (const link of toc.getElementsByTagName("a")) {
                const hash = new URL(link.href).hash;
                if (hash) {
                    const id = hash.startsWith("#") ? hash.substring("#".length) : hash;
                    const header = document.getElementById(id);
                    console.log(header, header?.parentElement);

                    if (header && header.parentElement?.tagName == "SECTION") {
                        const target = header.parentElement;
                        references.push({ id, link, target, visible: false });
                    } else {
                        console.warn(`Found link for '#${id}', but no target was found.`);
                    }
                }
            }
            if (references.length) {
                const observer = new IntersectionObserver((entries) => {
                    for (const entry of entries) {
                        const ref = references.find(x => entry.target === x.target);
                        if (ref) {
                            ref.visible = entry.isIntersecting;
                        }
                    }
                    let hasActive = false;
                    for (const ref of references) {
                        if (ref.visible && !hasActive) {
                            hasActive = true;
                            ref.link.style.textDecoration = "underline";
                            console.log(ref.id);
                        } else {
                            ref.link.style.textDecoration = "";
                        }
                    }
                }, { rootMargin: "10px" });

                for (const ref of references) {
                    observer.observe(ref.target);
                }
            }
        }
    }, { passive: true });
}

type TocReference = {
    id: string;
    link: HTMLAnchorElement;
    target: HTMLElement;
    visible: boolean;
}
