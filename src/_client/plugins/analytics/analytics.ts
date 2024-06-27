import { throttle } from "@martinstark/throttle-ts";
import { UmamiClient, buildUmamiClient } from "./umami-client";

// A micro-optimization to reduce bundle size.
const eventListenerOptions: AddEventListenerOptions = {
    passive: true // Run events async.
}

export function attachAnalytics() {
    addEventListener("DOMContentLoaded", () => {

        if (document.location.search?.includes("no-umami")) {
            localStorage.setItem("umami.disabled", "1")
        }

        // Only build umami after the DOM is fully ready.
        // To avoid race conditions around things like Title.
        // As always, this assumes all this is running
        // with tradition hyperlink navigation.
        const umami = buildUmamiClient();

        // Scroll End has issues in Safari...
        const [onScrollThrottled] = throttle(onScroll, 2_000);
        addEventListener("scroll", () => {
            void onScrollThrottled(umami);
        }, eventListenerOptions);

        addEventListener("hashchange", () => {
            void onHashChange(umami);
        }, eventListenerOptions);

        addEventListener("visibilitychange", () => {
            void onVisibilityChange(umami);
        }, eventListenerOptions);

        addEventListener("click", ({ target }) => {
            void onLinkClick(target, umami);
        }, eventListenerOptions);

        addEventListener("contextmenu", ({ target }) => {
            void onLinkClick(target, umami);
        }, eventListenerOptions);

        void onReady(umami);
        void onHashChange(umami);
    }, eventListenerOptions);
}

async function onReady(umami: UmamiClient) {
    await umami.trackView();
}

async function onScroll(umami: UmamiClient) {
    await umami.trackEvent("scroll");
}

async function onHashChange(umami: UmamiClient) {
    if (location.hash) {
        await umami.trackEvent("anchor-used", {
            link: window.location.pathname + location.hash
        });
    }
}

async function onVisibilityChange(umami: UmamiClient) {
    await umami.trackEvent("visibility-changed", {
        hidden: document.hidden
    });
}

async function onLinkClick(target: EventTarget | null, umami: UmamiClient) {
    // Walk upwards until either the root or an anchor.
    while (target && target instanceof Element && !(target instanceof HTMLAnchorElement)) {
        target = target.parentNode as EventTarget;
    }
    if (target instanceof HTMLAnchorElement && target.rel.includes("external")) {
        await umami.trackEvent("external-link", {
            href: target.href
        });
    }
}
