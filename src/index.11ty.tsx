import { About } from "./_components/about";
import { RenderContext, TemplateContext } from "./_components/eleventy-types";
import { Avatar } from "./_components/icons";
import { PostsList } from "./_components/posts-list";

export function data() {
    return {
        description: "Hello there! Welcome to my weblog, a place where I blog about random tech things and hard to find solutions."
    }
}

export function render(this: RenderContext, { collections }: TemplateContext) {
    return (
        <article>
            <section className="rounded p-6 mb-9 border border-gray-300 dark:bg-gray-800" aria-label="Author Introduction">
                <div className="flex flex-col lg:flex-row">
                    <Avatar className="self-center lg:self-start mt-3 lg:me-3" />
                    <div className="text-center lg:text-left my-6">
                        <div className="prose dark:prose-invert max-w-none mb-3">
                            <h1 className="title mb-1">
                                Hello there!
                            </h1>
                            <p className="mt-0">And welcome to my weblog.</p>
                        </div>
                        <About />
                    </div>
                </div>
            </section>
            <section aria-label="Blog posts">
                <PostsList collection={collections["posts"]} />
            </section>
        </article>
    );
}
