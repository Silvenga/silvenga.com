// https://umami.is/docs/api/sending-stats

// Cache this to work around possible ways to load this module when using a dev-server.
const data = document.currentScript?.dataset;

export type UmamiClient = {
    readonly enabled: boolean;
    readonly trackView: () => Promise<void>;
    readonly trackEvent: (eventName: string, data?: Record<string, unknown>) => Promise<void>;
}

export function buildUmamiClient(): UmamiClient {

    const context = buildContext();

    const track = async (payload?: Partial<UnamiEventPayload>) => {
        if (context) {
            const mergedPayload = {
                ...context.defaultPayload,
                ...payload
            };
            await fetch(context.settings.endpoint, {
                method: "POST",
                body: JSON.stringify({
                    payload: mergedPayload,
                    type: "event"
                }),
                headers: {
                    "Content-Type": "application/json",
                }
            });
        }
    }

    return {
        enabled: !!context,
        trackView: () => track(),
        trackEvent: (name, data) => track({ name, data }),
    }
}

function buildContext() {

    // This all assumes this is not a single page application.
    // Reduces code substantially, however, this MUST be loaded only as deferred (not async).

    // Settings
    const allowedDomains = data?.umamiDomains?.split(",").map(x => x.trim().toLowerCase()) ?? [];
    const websiteId = data?.umamiWebsiteId?.trim();
    const endpoint = data?.umamiEndpoint?.trim();

    console.log({ allowedDomains, websiteId, endpoint, data }, { origin: location.hostname });

    // Enabled
    const enabled = !!websiteId
        && !!endpoint
        && (allowedDomains.length == 0 || allowedDomains.includes(location.hostname))
        && isUmamiAllowedByPolicy();

    if (enabled) {
        // Default Payload
        const settings = {
            allowedDomains,
            websiteId,
            endpoint
        }

        // Matches https://github.com/umami-software/umami/blob/master/src/tracker/index.js
        const defaultPayload: UnamiEventPayload = {
            website: websiteId,
            hostname: window.location.hostname,
            screen: `${window.screen.width}x${window.screen.height}`,
            language: window.navigator.language,
            title: encode(document.title),
            url: encode(getPathAndSearch(location.href)),
            referrer: document.referrer !== document.location.hostname // Not sure when this would ever be false?
                ? encode(document.referrer)
                : ""
        }
        return {
            settings,
            defaultPayload
        };
    } else {
        console.log("Analytics disabled.")
    }
}

function isUmamiAllowedByPolicy() {
    const disabledByLocalStorage = localStorage.getItem("umami.disabled");
    return !disabledByLocalStorage;
}

type UnamiEventPayload = {
    hostname: string;
    language: string;
    referrer: string;
    screen: string;
    title: string;
    url: string;
    website: string;
    name?: string;
    data?: Record<string, unknown>;
}

// https://github.com/umami-software/umami/blob/master/src/tracker/index.js

function encode(str: string): string;
function encode(str?: string): string | undefined {
    if (!str) {
        return undefined;
    }

    try {
        const result = decodeURI(str);

        if (result !== str) {
            return result;
        }
    } catch {
        return str;
    }

    return encodeURI(str);
};

function getPathAndSearch(url: string) {
    try {
        const { pathname, search } = new URL(url);
        url = pathname + search;
    } catch {
        /* empty */
    }
    return url;
};
