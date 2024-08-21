import { documentOnLoaded } from "../../on-load";

const BackdropId = "lightbox-backdrop";
const TailwindAnimationTimeoutMs = 0.15 * 1000;

export function attachLightBox() {
    documentOnLoaded(() => {
        addEventListener("click", (event) => {
            if (event.target instanceof HTMLElement
                && event.target.classList.contains("lightbox-subject")) {
                console.log(event);
                toggleLightbox(event.target);
            }
        });
    })
}

function toggleLightbox(target: HTMLElement) {
    if (isLightboxOpen(target)) {
        closeLightbox(target);
    } else {
        openLightbox(target);
    }
}

function openLightbox(target: HTMLElement) {
    if (isLightboxOpen(target)) {
        return;
    }
    target.dataset.lightbox = "open";

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const targetBounds = target.getBoundingClientRect();

    // If no width/height attribute exists (added by the image processing pipeline),
    // then do not attempt to clamp on the in intrinsic size (to support light-boxing non-images).
    const idealWidth = target.hasAttribute("width")
        ? parseInt(target.getAttribute("width")!)
        : Number.MAX_SAFE_INTEGER;
    const idealHeight = target.hasAttribute("height")
        ? parseInt(target.getAttribute("height")!)
        : Number.MAX_SAFE_INTEGER;

    const translateX = (viewportWidth / 2) - targetBounds.left - (targetBounds.width / 2);
    const translateY = (viewportHeight / 2) - targetBounds.top - (targetBounds.height / 2);

    const margin = 40;

    const scale = Math.min(
        // Clamp on viewport size.
        viewportWidth / (targetBounds.width + margin),
        viewportHeight / (targetBounds.height + margin),
        // Clamp on the resolution of the image.
        idealWidth / targetBounds.width,
        idealHeight / targetBounds.height,
    );

    target.classList.add("open");
    target.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale * 100}%)`;
    target.style.zIndex = "10";

    const backdrop = openLightboxBackdrop();
    backdrop.addEventListener("click", () => closeLightbox(target), { once: true, passive: true });
    addEventListener("scroll", () => closeLightbox(target), { once: true, passive: true });
    addEventListener("resize", () => closeLightbox(target), { once: true, passive: true });
}

function closeLightbox(target: HTMLElement) {
    if (!isLightboxOpen(target)) {
        return;
    }

    delete target.dataset.lightbox;
    target.style.transform = "";
    target.classList.remove("open");
    closeLightboxBackdrop();

    setTimeout(() => {
        // Avoid a dirty write.
        if (!isLightboxOpen(target)) {
            target.style.zIndex = ""
        }
    }, TailwindAnimationTimeoutMs);
}

function isLightboxOpen(target: HTMLElement) {
    return target.dataset.lightbox == "open";
}

function openLightboxBackdrop() {
    let lightbox = document.getElementById(BackdropId);
    if (!lightbox) {
        lightbox = document.createElement("div")
        lightbox.id = BackdropId;
        lightbox.classList.add("lightbox-backdrop", "open");
        lightbox.ariaHidden = "";
        document.body.appendChild(lightbox);
    } else {
        lightbox.classList.add("open");
    }
    return lightbox;
}

function closeLightboxBackdrop() {
    const lightbox = document.getElementById(BackdropId);
    if (lightbox) {
        lightbox.classList.remove("open");
    }
    return lightbox;
}
