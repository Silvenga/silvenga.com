export type CustomActionPayload = {
    name: string;
    data?: Record<string, unknown>;
}

export const CustomEventName = "custom-track-action";

export function dispatchCustomAction(element: HTMLElement, payload: CustomActionPayload) {
    try {
        const event = new CustomEvent<CustomActionPayload>(CustomEventName, {
            bubbles: true,
            cancelable: false,
            detail: payload
        });
        element.dispatchEvent(event);
    } catch (e) {
        console.warn("Failed to dispatch custom event, error: ", e)
    }
}
