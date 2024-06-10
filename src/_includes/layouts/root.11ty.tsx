import { RenderContext, TemplateContext } from "../../_components/eleventy-types";
import { RootLayout } from "../../_components/layouts/root-layout";
import { renderJsx } from "../../_components/render-jsx";

export function render(this: RenderContext, props: TemplateContext): string {
    const layout = RootLayout.call(this, props);
    return renderJsx(layout);
}
