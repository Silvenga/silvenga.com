import { DateTime } from "luxon";
import { About } from "../about";
import { Avatar } from "../avatar";
import { RenderContext, TemplateContext } from "../eleventy-types";
import { ReadableDate } from "../readable-date";

export type PostsLayoutProps = {
    children: JSX.Element;
} & TemplateContext;

export function PostsLayout(this: RenderContext, { tags, title, content, collections, page, author, archived }: PostsLayoutProps) {

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
                                <li key={tag} className="me-3 badge badge-outline p-3">
                                    #{tag}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
                {!!archived && (
                    <section aria-label="Post has been archived warning" className="border border-warning rounded p-3 text-center my-9">
                        This post was archived on {DateTime.fromJSDate(archived).toFormat("LLLL d, yyyy")}. The content may be old and no longer arcuate.
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
