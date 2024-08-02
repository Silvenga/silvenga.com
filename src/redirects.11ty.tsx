import { RenderContext, TemplateContext } from "./_components/eleventy-types";
import { RedirectItem } from "./_components/redirects-collection";

export function data() {
    return {
        eleventyExcludeFromCollections: true,
        pagination: {
            data: "collections.redirects",
            size: 1,
            alias: "redirect",
        },
        eleventyComputed: {
            title: (data: ComputedData) => data.redirect.canonicalItem.data.title,
            permalink: (data: ComputedData) => data.redirect.aliasPermLink,
            description: (data: ComputedData) => data.redirect.canonicalItem.data.description,
            canonicalUrl: (data: ComputedData) => data.redirect.canonicalPermLink,
            refreshUrl: (data: ComputedData) => data.redirect.canonicalPermLink,
        }
    }
}

export function render(this: RenderContext, props: TemplateContext) {
    const redirect = props.redirect as RedirectItem;
    return (
        <article>
            <h1>{redirect.canonicalItem.data.title} Moved</h1>
            <p>This content has been moved. Click <a href={this.url(redirect.canonicalPermLink)}>here</a> if you are not automatically redirected.</p>
        </article>
    );
}

export type ComputedData = TemplateContext & {
    redirect: RedirectItem;
}
