import { About } from "../about";
import { RenderContext, TemplateContext } from "../eleventy-types";
import { Avatar, CcByIcon, CcIcon, CcSaIcon } from "../icons";
import { ReadableDate } from "../readable-date";
import { extractToc } from "../utilities/extract-toc";

const ContentTopId = "content-top";

export type PostsLayoutProps = {
    children: JSX.Element;
} & TemplateContext;

export function PostsLayout(this: RenderContext, { title, content, page, created, updated, archived, draft }: PostsLayoutProps) {

    const editLink = getEditUrl(page.inputPath);
    const contentParseResult = extractToc(content);

    return (
        <article>
            <header id={ContentTopId} className="mb-9">
                <div className="flex flex-wrap mb-3 text-nowrap flex-col sm:flex-row">
                    {!draft
                        ? (<>
                            <span className="sr-only">Published on</span> <ReadableDate dateTime={created} />
                        </>)
                        : (<>
                            <span className="font-bold">Unpublished</span>
                        </>)}
                    <span className="mx-3 hidden sm:inline-block" aria-hidden>•</span>
                    <div className="flex">
                        <div><span className="sr-only">Takes approximately</span> {this.timeToRead(content)} <span className="sr-only">to read</span></div>
                        <span className="mx-3" aria-hidden>•</span>
                        <a className="link" href={editLink} rel="noreferrer noopener" target="_blank">Post History</a>
                    </div>
                </div>
                <h1 className="title mb-3">{title}</h1>
                {!!archived && <ArchivedWarningCard archived={archived} />}
            </header>
            {contentParseResult.result == "NoToc" && (
                <Content content={content} />
            )}
            {contentParseResult.result == "HasToc" && (
                <div className="relative">
                    <SideToc content={contentParseResult.tocTree} />
                    <Content content={contentParseResult.remainingTree} />
                </div>
            )}
            <footer className="mt-12">
                <AuthorCard />
                <div className="mt-6">
                    {!!updated && updated != created && (
                        <p className="mb-1 text-center">
                            Updated on <ReadableDate dateTime={updated} />
                        </p>
                    )}
                    <CreativeCommonsDisclaimer />
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

function CreativeCommonsDisclaimer() {
    return (
        <section className="flex flex-col items-center">
            <div>
                <span>Published under the </span>
                <a href="https://creativecommons.org/licenses/by-sa/4.0/"
                    rel="noreferrer noopener"
                    target="_blank"
                    className="link link-hover"
                    aria-label="Creative commons Attribution-ShareAlike 4.0 license">
                    CC BY-SA 4.0 License
                </a>
                <span>.</span>
            </div>
            <div className="flex justify-center mt-2" aria-hidden>
                <CcIcon className="h-6 w-6" />
                <CcByIcon className="h-6 w-6 mx-2" />
                <CcSaIcon className="h-6 w-6" />
            </div>
        </section>
    );
}

function Content({ content }: { content: string }) {
    return (
        <div className="prose dark:prose-invert prose-pre:p-0"
            dangerouslySetInnerHTML={{ __html: content }} />
    )
}

function SideToc({ content }: { content: string }) {
    return (
        // (xl (1280px) - site width (720px)) / 2 = 280px
        <div className="xl:absolute left-full bottom-0 top-0 w-max xl:w-[280px] xl:ps-6">
            <div className="sticky top-4 max-h-screen overflow-y-auto mb-3">
                <aside id="toc-block" className="prose dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: content }} />
                <div className="hidden xl:block">
                    <hr />
                    <div className="py-4">
                        <a className="top toc-link" href={`#${ContentTopId}`}>Top</a>
                    </div>
                </div>
            </div>
        </div>
    )
}
