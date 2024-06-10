import { About } from "./_components/about";
import { Avatar } from "./_components/avatar";
import { RenderContext, TemplateContext } from "./_components/eleventy-types";
import { PostsList } from "./_components/posts-list";

export function render(this: RenderContext, { collections }: TemplateContext) {
    return (
        <article>
            <header className="rounded p-6 mb-9 border border-gray-300 dark:bg-gray-800">
                <div className="flex flex-col lg:flex-row">
                    <Avatar className="self-center lg:self-start mt-3 lg:me-3" />
                    <div className="text-center lg:text-left my-6">
                        <h1 className="text-5xl font-light mb-2">
                            Hello there!
                        </h1>
                        <p className="mb-6">And welcome to my weblog.</p>
                        <About />
                    </div>
                </div>
            </header>
            <section aria-label="Blog posts">
                <PostsList collection={collections["posts"]} />
            </section>
        </article>
    );
}
