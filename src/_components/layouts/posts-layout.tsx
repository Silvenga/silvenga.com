import { About } from "../about";
import { Avatar } from "../avatar";
import { RenderContext, TemplateContext } from "../eleventy-types";
import { ReadableDate } from "../readable-date";

export type PostsLayoutProps = {
    children: JSX.Element;
} & TemplateContext;

export function PostsLayout(this: RenderContext, { tags, title, content, collections, page, created, updated, archived, draft }: PostsLayoutProps) {

    const postTags = tags?.filter(tag => collections.publicTags.find(x => x == tag));
    const editLink = getEditUrl(page.inputPath);

    return (
        <article>
            <header className="mb-9">
                <div className="flex flex-wrap mb-3 text-nowrap flex-col sm:flex-row">
                    {!draft
                        ? (
                            <>
                                <span className="sr-only">Published on</span> <ReadableDate dateTime={created} />
                            </>
                        )
                        : (
                            <>
                                <span className="font-bold">Unpublished</span>
                            </>
                        )}
                    <span className="mx-3 hidden sm:inline-block" aria-hidden>•</span>
                    <div className="flex">
                        <div><span className="sr-only">Takes approximately</span> {this.timeToRead(content)} <span className="sr-only">minutes to read</span></div>
                        <span className="mx-3" aria-hidden>•</span>
                        <a className="link" href={editLink} rel="noreferrer noopener" target="_blank" aria-hidden>Post History</a>
                    </div>
                </div>
                <h1 className="font-light text-5xl mb-3">{title}</h1>
                {!!postTags && postTags.length > 0 && (
                    <section aria-label="Post tag list">
                        <ul className="list-none flex">
                            {postTags.map(tag => (
                                <li key={tag} className="me-2 border rounded-full p-2">
                                    #{tag}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
                {!!archived && <ArchivedWarningCard archived={archived} />}
            </header>
            <div className="prose pose dark:prose-invert max-w-[100%] prose-pre:p-0" dangerouslySetInnerHTML={{ __html: content }} />
            <footer>
                {!!updated && updated != created && (
                    <p className="mt-12 text-center">
                        Updated on <ReadableDate dateTime={updated} />
                        <span className="mx-3" aria-hidden>•</span>
                        <a className="link" href={editLink} rel="noreferrer noopener" target="_blank">Post History</a>
                    </p>
                )}
                <div className="my-24">
                    <AuthorCard />
                    <div className="text-center mt-6">
                        Written under the <a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="noreferrer noopener" target="_blank" className="link link-hover">Creative Commons Attribution-ShareAlike 4.0 International License</a>.
                    </div>
                </div>
            </footer>
        </article>
    );
}

function AuthorCard() {
    return (
        <address className="not-italic border rounded p-6 flex lg:flex-row flex-col items-center text-center lg:text-left dark:bg-gray-800">
            <Avatar className="lg:basis-1/3 ml mb-3" />
            <About className="lg:basis-2/3" />
        </address>
    )
}

function ArchivedWarningCard({ archived }: { archived: Date }) {
    return (
        <section aria-label="Post has been archived warning" className="border text-black border-yellow-500 rounded bg-yellow-100 p-3 text-center my-9">
            <p>
                This post was archived on <ReadableDate className="font-medium" dateTime={archived} />.
            </p>
            <p>
                The content may be old and no longer accurate.
            </p>
        </section>
    );
}

function getEditUrl(inputPath: string) {
    if (inputPath.startsWith("./") || inputPath.startsWith(".\\")) {
        inputPath = inputPath.substring(2);
    }
    return `https://github.com/Silvenga/silvenga.com/blame/master/${inputPath}`
}
