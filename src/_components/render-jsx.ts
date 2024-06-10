import { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

export function renderJsx(dom: ReactNode): string {
    return "<!DOCTYPE html>\n" + renderToStaticMarkup(dom);
}
