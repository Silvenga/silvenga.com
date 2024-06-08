import { LayoutContext } from "../../_components/eleventy-types";

export function render({ content }: LayoutContext) {
    return (
        <>
            test
            {content}
        </>
    );
}
