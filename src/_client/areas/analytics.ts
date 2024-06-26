/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { throttle } from "@martinstark/throttle-ts";

export function attachAnalytics() {

    // Scroll End has issues in Safari...
    const [onScrollThrottled] = throttle(onScroll, 2_000);
    addEventListener("scroll", () => {
        void onScrollThrottled();
    }, { passive: true });

    addEventListener("hashchange", () => {
        void onHashChange();
    }, { passive: true });

    addEventListener("visibilitychange", () => {
        void onVisibilityChange();
    }, { passive: true });

    addEventListener("click", ({ target }) => {
        void onLinkClick(target);
    }, { passive: true });

    addEventListener("contextmenu", ({ target }) => {
        void onLinkClick(target);
    }, { passive: true });

    void onHashChange();
}

async function onScroll() {
    const umami = getUmami();
    await umami?.track("scroll");
}

async function onHashChange() {
    const umami = getUmami();
    if (location.hash) {
        await umami?.track("anchor-used", {
            link: window.location.pathname + location.hash
        });
    }
}

async function onVisibilityChange() {
    const umami = getUmami();
    await umami?.track("visibility-changed", {
        hidden: document.hidden
    });
}

async function onLinkClick(target: EventTarget | null) {
    // Walk upwards until either the root or an anchor.
    while (target && target instanceof Element && !(target instanceof HTMLAnchorElement)) {
        target = target.parentNode as EventTarget;
    }
    if (target instanceof HTMLAnchorElement && target.rel.includes("external")) {
        const umami = getUmami();
        await umami?.track("external-link", {
            href: target.href
        })
    }
}

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
function getUmami(): umami.umami | undefined {
    return window.umami;
}
