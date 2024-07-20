import { DateTime } from "luxon";
import { RenderContext, TemplateContext } from "../eleventy-types";
import { Footer } from "../footer";
import { Navbar } from "../navbar";

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
    const noIndex = !!props.noIndex;

    return (
        <html lang="en" dir="ltr">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />

                <title>{pageTitle}</title>

                <link href="/src/styles/main.css" rel="stylesheet preload" as="style" type="text/css" />

                <link rel="canonical" href={canonicalUrl} />
                <link rel="alternate" type="application/rss+xml" href={this.url("/posts/rss.xml")} title="RSS Feed" />

                <link rel="icon" type="image/svg+xml" href="/src/assets/favicon.svg" />
                <link rel="icon" type="image/png" href="/src/assets/favicon.png" />

                <meta name="generator" content={eleventy.generator} />
                <meta name="updated-on" content={getIsoDateOrEmpty(props.updated)} />
                <meta name="color-scheme" content="dark light" />

                <meta property="og:title" content={title || site.name} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:site_name" content={site.name} />
                <meta property="og:locale" content="en_US" />

                <meta name="fediverse:creator" content="@silvenga@slvn.social" />

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

                {!!noIndex && (
                    <meta name="robots" content="noindex" />
                )}

                <script async src="/src/client.ts" type="module"
                    data-umami-website-id={site.umami?.websiteId}
                    data-umami-domains={site.umami?.domains}
                    data-umami-endpoint={site.umami?.endpoint} />
            </head>

            <body className="container mx-auto w-[100%] max-w-[680px] px-6 md:p-0 min-h-svh flex flex-col">
                <Navbar site={site} renderContent={this} />
                <main dangerouslySetInnerHTML={{ __html: content }} />
                <Footer />
            </body>
        </html>
    );
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
