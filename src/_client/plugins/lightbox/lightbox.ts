const BackdropId = "light-box-backdrop";
const TailwindAnimationTimeoutMs = 0.15 * 100;

export function attachLightBox() {
    addEventListener("DOMContentLoaded", () => {
        addEventListener("click", (event) => {
            if (event.target instanceof HTMLImageElement
                && event.target.classList.contains("lightbox-subject")) {
                toggleLightbox(event.target);
            }
        });
    })
}

function toggleLightbox(target: HTMLImageElement) {
    if (isLightboxOpen(target)) {
        closeLightbox(target);
    } else {
        openLightbox(target);
    }
}

function openLightbox(target: HTMLImageElement) {
    if (isLightboxOpen(target)) {
        return;
    }
    target.dataset.lightbox = "open";

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const targetBounds = target.getBoundingClientRect();

    const idealWidth = target.hasAttribute("width")
        ? parseInt(target.getAttribute("width")!)
        : target.width;
    const idealHeight = target.hasAttribute("height")
        ? parseInt(target.getAttribute("height")!)
        : target.height;

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

function closeLightbox(target: HTMLImageElement) {
    if (!isLightboxOpen(target)) {
        return;
    }

    target.dataset.lightbox = "";
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

function isLightboxOpen(target: HTMLImageElement) {
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
