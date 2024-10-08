import { documentOnLoaded } from "../../on-load";
import { CustomActionPayload, CustomEventName } from "./custom-actions";
import { UmamiClient, buildUmamiClient } from "./umami-client";

// Hoisted as a micro-optimization to reduce uncompressed bundle size.
const eventListenerOptions: AddEventListenerOptions = {
    passive: true // Run events async.
}

export function attachAnalytics() {
    documentOnLoaded(() => {

        if (document.location.search?.includes("no-umami")) {
            localStorage.setItem("umami.disabled", "1")
        }

        // Only build umami after the DOM is fully ready.
        // To avoid race conditions around things like Title.
        // As always, this assumes all this is running
        // with tradition hyperlink navigation.
        const umami = buildUmamiClient();

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

        window.addEventListener(CustomEventName, (e) => {
            const customEvent = e as CustomEvent<CustomActionPayload>;
            const payload = customEvent.detail;
            void onCustomAction(umami, payload);
        }, eventListenerOptions);

        attachPresenceHandler(umami);

        void onReady(umami);
        void onHashChange(umami);
    }, eventListenerOptions);
}

async function onReady(umami: UmamiClient) {
    await umami.trackView();
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
    // ^ Actually, not sure this is needed, events should bubble.
    while (target && target instanceof Element && !(target instanceof HTMLAnchorElement)) {
        target = target.parentNode as EventTarget;
    }
    if (target instanceof HTMLAnchorElement && target.rel.includes("external")) {
        await umami.trackEvent("external-link", {
            page: window.location.pathname,
            href: target.href
        });
    }
}

async function onCustomAction(umami: UmamiClient, data: CustomActionPayload) {
    await umami.trackEvent(data.name, {
        page: window.location.pathname,
        ...data.data
    });
}

function attachPresenceHandler(umami: UmamiClient) {

    const state = { presenceEvents: 0 }

    async function onSessionDurationChanged(umami: UmamiClient) {
        if (state.presenceEvents < 30) {
            await umami.trackEvent("presence", {
                page: window.location.pathname
            });
            state.presenceEvents++;
        }
    }

    function createInterval() {
        return setInterval(() => {
            void onSessionDurationChanged(umami);
        }, 60_000)
    }

    const timerState: { intervalId?: NodeJS.Timeout } = {};
    timerState.intervalId = createInterval();

    addEventListener("visibilitychange", () => {
        const hidden = document.visibilityState === "hidden";
        if (hidden) {
            if (timerState.intervalId) {
                clearInterval(timerState.intervalId);
                timerState.intervalId = undefined;
            }
        } else {
            if (!timerState.intervalId) {
                timerState.intervalId = createInterval();
            }
        }
    }, eventListenerOptions);
}
