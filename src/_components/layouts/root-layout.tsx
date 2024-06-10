import { RenderContext, TemplateContext } from "../eleventy-types";
import { GithubIcon } from "../icons";

// TODO: Favicons
// TODO: Mermaid
// Escaping is weird.

export function RootLayout(this: RenderContext, { description, site, title, content, page, eleventy, ...props }: TemplateContext) {

    const canonicalUrl = this.url(site.baseUrl + page.url);
    const pageTitle = title ? `${title} | ${site.name}` : site.name;

    return (
        <>
            <html lang="en">
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="generator" content={ eleventy.generator } />

                <link rel="canonical" href={canonicalUrl} />
                <link rel="alternate" type="application/rss+xml" href="/posts/posts.rss" title="RSS Feed" />
                <link href="/src/styles.css" type="text/css" rel="stylesheet" />

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
                <body className="container mx-auto max-w-[72ch] px-[2ch] min-h-svh flex flex-col">
                    <Header site={site} renderContent={this} />

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

function Header(this: RenderContext, { site, renderContent }: Pick<TemplateContext, "site"> & { renderContent: RenderContext }): JSX.Element {
    return (
        <nav className="navbar bg-base-100 p-0 mb-9">
            <div className="flex-1">
                <a className="link link-hover text-xl" href="/">{site.name}</a>
            </div>

            <ul className="list-none flex">
                <li className="me-3">
                    <a className="link" href={renderContent.url("/posts/")}>
                        Posts
                    </a>
                </li>
                <li>
                    <a className="link link-hover" href="https://github.com/Silvenga" rel="noreferrer noopener" target="_blank">
                        <div className="h-6 w-6 aspect-square">
                            <GithubIcon />
                        </div>
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
            <div className="">
                Copyright © {year}. Built with <span style={{ color: "#deabab" }}>&#x2764;&#xfe0e;</span> by <a className="link link-hover" href="https://github.com/Silvenga" rel="noreferrer noopener" target="_blank">Silvenga</a>
            </div>
        </footer>
    )
}
