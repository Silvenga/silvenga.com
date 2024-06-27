import { DateTime } from "luxon";
import { RenderContext, TemplateContext } from "../eleventy-types";
import { BlogIcon, GithubIcon, RssIcon } from "../icons";

export function RootLayout(this: RenderContext, { description, site, title, content, page, eleventy, refreshUrl, ...props }: TemplateContext) {

    const canonicalUrl = this.url(site.baseUrl + (props.canonicalUrl ?? page.url));
    const pageTitle = title ? `${title} | ${site.name}` : site.name;

    if (!description) {
        console.warn(`[warning - RootLayout] No description set for page '${page.inputPath}'.`);

        if (process.env["GITHUB_ACTIONS"] == "true") {
            console.warn(`::warning file=${page.inputPath},title=HTML Description Missing::No description was rendered, this should be corrected by adding the appropriate front-matter.`)
        }
    }

    const type = getType(props.type);
    const publicTags = props.tags?.filter(tag => props.collections.publicTags.find(x => x == tag)) ?? [];

    return (
        <>
            <html lang="en" dir="ltr">
                <head>
                    <meta charSet="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

                    <title>{pageTitle}</title>
                    <link href="/src/styles.css" type="text/css" rel="stylesheet" />
                    <link href="npm:@fontsource-variable/inter/files/inter-latin-wght-normal.woff2" rel="preload" as="font" type="font/woff2" />

                    <link rel="canonical" href={canonicalUrl} />
                    <link rel="alternate" type="application/rss+xml" href={this.url("/posts/rss.xml")} title="RSS Feed" />

                    <link rel="icon" type="image/svg+xml" href="/src/assets/favicon.svg" />
                    <link rel="icon" type="image/png" href="/src/assets/favicon.png" />

                    <meta name="generator" content={eleventy.generator} />
                    <meta name="updated-on" content={getIsoDateOrEmpty(props.updated)} />

                    <meta property="og:title" content={title || site.name} />
                    <meta property="og:url" content={canonicalUrl} />
                    <meta property="og:site_name" content={site.name} />
                    <meta property="og:locale" content="en_US" />

                    {/* This one is just weird, parcel refuses to add the hash to the url, so manually done. */}
                    <meta property="og:image" content="/src/assets/social-card.51bcc36a.webp" />
                    <meta property="og:image:type" content="image/webp" />
                    <meta property="og:image:width" content="1200" />
                    <meta property="og:image:height" content="630" />

                    {type == "website" && (
                        <>
                            <meta property="og:type" content="website" />
                        </>
                    )}
                    {type == "article" && (
                        <>
                            <meta property="og:type" content="article" />
                            <meta property="article:published_time" content={getIsoDateOrEmpty(props.created)} />
                            <meta property="article:modified_time" content={getIsoDateOrEmpty(props.updated)} />
                            <meta property="article:author" content={props.author} />
                            {publicTags.map(x => (
                                <meta key={x} property="article:tag" content={x} />
                            ))}
                        </>
                    )}

                    {!!description && (
                        <>
                            <meta name="description" content={description} />
                            <meta property="og:description" content={description} />
                        </>
                    )}

                    {!!refreshUrl && (
                        <meta httpEquiv="Refresh" content={`0; URL=${this.url(site.baseUrl + refreshUrl)}`} />
                    )}

                    <script defer src="/src/client.ts" type="module"
                        data-umami-website-id={site.umami?.websiteId}
                        data-umami-domains={site.umami?.domains}
                        data-umami-endpoint={site.umami?.endpoint} />
                </head>

                <body className="container mx-auto w-[100%] max-w-[720px] px-[20px] min-h-svh flex flex-col">
                    <Navbar site={site} renderContent={this} />
                    <main dangerouslySetInnerHTML={{ __html: content }} />
                    <Footer />
                </body>
            </html>
        </>
    );
}

function Navbar(this: RenderContext, { site, renderContent }: Pick<TemplateContext, "site"> & { renderContent: RenderContext }): JSX.Element {

    const navLinks = [
        { display: "All Posts", href: "/posts/" },
        { display: "3D Models", href: "/models/" },
    ];

    return (
        <nav className="mb-0 sm:mb-9 py-6">

            <div className="flex flex-1">
                <div className="flex flex-1">
                    <BlogIcon className="h-6 w-6 aspect-square me-3" />
                    <a className="link link-hover text-xl" href="/">{site.name}</a>
                </div>

                <ul className="list-none flex">
                    {/* Shown in >= sm */}
                    {navLinks.map(x => (
                        <li key={x.display} className="me-3 sm:block hidden">
                            <a className="link" href={renderContent.url(x.href)}>
                                {x.display}
                            </a>
                        </li>
                    ))}
                    <li className="ms-3 me-3">
                        <a className="link link-hover" href={renderContent.url("/posts/rss.xml")} rel="noreferrer noopener" target="_blank">
                            <RssIcon className="h-6 w-6 aspect-square" />
                        </a>
                    </li>
                    <li>
                        <a className="link link-hover" href="https://github.com/Silvenga" rel="noreferrer noopener" target="_blank">
                            <GithubIcon className="h-6 w-6 aspect-square" />
                        </a>
                    </li>
                </ul>
            </div>

            <ul className="list-none sm:hidden flex flex-1 mt-3">
                {/* Shown in < sm */}
                {navLinks.map(x => (
                    <li key={x.display} className="me-3">
                        <a className="link" href={renderContent.url(x.href)}>
                            {x.display}
                        </a>
                    </li>
                ))}
            </ul>

        </nav>
    )
}

function Footer(): JSX.Element {
    const year = new Date().getFullYear();
    return (
        <footer className="py-9 flex flex-col justify-center items-center mt-auto">
            <div className="text-center">
                Copyright © {year}. Built with <span className="text-[#ad4d4d] dark:text-[#deabab]">&#x2764;&#xfe0e;</span> by Silvenga
            </div>
            <div className="text-center">
                Metrics gathered by Umami, privacy-focused-analytics. No cookies are saved.
            </div>
            <div className="text-center">
                <a className="link link-hover" href="https://github.com/Silvenga/silvenga.com" rel="noreferrer noopener" target="_blank">[Source Code]</a>
            </div>
        </footer>
    )
}

function getType(type?: string): "website" | "article" {
    if (type == "article") {
        return "article";
    }
    return "website";
}

function getIsoDateOrEmpty(date?: Date): string {
    if (date === undefined) {
        return "-";
    }
    const dateTime = DateTime.fromJSDate(date);
    if (!dateTime.isValid) {
        return "";
    }
    return dateTime.toISO();
}
