import { RenderContext } from "./_components/eleventy-types";

export function data() {
    return {
        title: "Page Not Found",
        permalink: "/404.html",
        eleventyExcludeFromCollections: true,
        description: "This page no longer exists, or never existed, or many exist in the future."
    }
}

export function render(this: RenderContext) {
    return (
        <article className="text-center">
            <h1 className="text-5xl">404: Not Found</h1>
            <p className="my-9">Nothing is here, <a className="link font-medium" href={this.url("/")}>go home</a>?</p>
        </article>
    );
}
