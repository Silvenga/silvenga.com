export function documentOnLoaded(callback: () => void, options?: AddEventListenerOptions) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback, options);
    } else {
        callback();
    }
}
