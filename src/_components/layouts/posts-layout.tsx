/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-key */

import { About } from "../about";
import { Avatar } from "../avatar";
import { RenderContext, TemplateContext } from "../eleventy-types";
import { ReadableDate } from "../readable-date";

export type PostsLayoutProps = {
    children: JSX.Element;
} & TemplateContext;

export function PostsLayout(this: RenderContext, { tags, title, content, collections, page, author, site }: PostsLayoutProps) {

    const postTags = tags?.filter(tag => collections.publicTags.find(x => x == tag));
    const editLink = `https://github.com/Silvenga/silvenga.com/blame/master/${page.inputPath}`;

    return (
        <article>
            <header>
                <div className="flex mb-3">
                    <ReadableDate dateTime={page.date} />
                    <span className="mx-3">•</span>
                    <div title="Reading time">{this.timeToRead(content)}</div>
                    <span className="mx-3">•</span>
                    <a className="link" href={editLink} rel="noreferrer noopener" target="_blank">Post History</a>
                </div>
                <h1 className="font-light text-5xl mb-3">{title}</h1>
                {!!postTags && postTags.length > 0 && (
                    <section aria-label="Post tag list">
                        <ul className="list-none flex">
                            {postTags.map(tag => (
                                <li className="me-3 badge badge-outline p-3">
                                    #{tag}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </header>
            <div className="prose mx-auto" dangerouslySetInnerHTML={{ __html: content }} />
            <footer className="mt-9">
                {author
                    ? <address className="text-center">Written by {author}</address>
                    : <AuthorCard />}
            </footer>
        </article>
    );
}

function AuthorCard() {
    return (
        <address className="not-italic border rounded p-3 flex items-center">
            <Avatar />
            <About />
        </address>
    )
}
