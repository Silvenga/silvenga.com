import { RenderContext, TemplateContext } from "../eleventy-types";
import { BlogIcon, GithubIcon, RssIcon } from "../icons";

// TODO: Favicons
// TODO: Mermaid

export function RootLayout(this: RenderContext, { description, site, title, content, page, eleventy, ...props }: TemplateContext) {
    const canonicalUrl = this.url(site.baseUrl + page.url);
    const pageTitle = title ? `${title} | ${site.name}` : site.name;

    return (
        <>
            <html lang="en">
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="generator" content={eleventy.generator} />

                <link rel="canonical" href={canonicalUrl} />
                <link rel="alternate" type="application/rss+xml" href={this.url("/atom-posts.xml")} title="RSS Feed" />
                <link href="/src/styles.css" type="text/css" rel="stylesheet" />
                <link rel="icon" type="image/svg+xml" href="/src/assets/favicon.svg" />
                <link rel="icon" type="image/png" href="/src/assets/favicon.png" />

                <title>{pageTitle}</title>

                <meta property="og:title" content={title || site.name} />
                <meta property="og:site_name" content={site.name} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={canonicalUrl} />

                {!!description && (
                    <>
                        <meta name="description" content={description} />
                        <meta property="og:description" content={description} />
                    </>
                )}
                <body className="container mx-auto w-[100%] max-w-[720px] px-[20px] min-h-svh flex flex-col">
                    <Navbar site={site} renderContent={this} />

                    <main>
                        {/* Content can either be a string or a ReactNode */}
                        {/* If a string, should likely set the HTML directly to avoid escaping. */}
                        {/* A later me problem. */}
                        {content}
                    </main>

                    <Footer />
                </body>
            </html>
        </>
    );
}

function Navbar(this: RenderContext, { site, renderContent }: Pick<TemplateContext, "site"> & { renderContent: RenderContext }): JSX.Element {
    return (
        <nav className="flex flex-col sm:flex-row sm:items-start items-center bg-base-100 mb-3 sm:mb-9 py-6">

            <div className="flex flex-1">
                <BlogIcon className="h-6 w-6 aspect-square me-3" />
                <a className="link link-hover text-xl" href="/">{site.name}</a>
            </div>

            <ul className="list-none flex sm:mt-0 mt-6">
                <li className="me-3">
                    <a className="link" href={renderContent.url("/posts/")}>
                        All Posts
                    </a>
                </li>
                <li className="me-3">
                    <a className="link link-hover" href={renderContent.url("/atom-posts.xml")} rel="noreferrer noopener" target="_blank">
                        <RssIcon className="h-6 w-6 aspect-square" />
                    </a>
                </li>
                <li>
                    <a className="link link-hover" href="https://github.com/Silvenga" rel="noreferrer noopener" target="_blank">
                        <GithubIcon className="h-6 w-6 aspect-square" />
                    </a>
                </li>
            </ul>

        </nav>
    )
}

function Footer(): JSX.Element {
    const year = new Date().getFullYear();
    return (
        <footer className="py-9 flex justify-center mt-auto">
            <div className="text-center">
                Copyright © {year}. Built with <span className="text-[#ad4d4d] dark:text-[#deabab]">&#x2764;&#xfe0e;</span> by <a className="link link-hover" href="https://github.com/Silvenga" rel="noreferrer noopener" target="_blank">Silvenga</a>
            </div>
        </footer>
    )
}
