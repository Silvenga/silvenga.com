import { ThemeToggle } from "./dark-mode-toggle";
import { RenderContext, TemplateContext } from "./eleventy-types";
import { BlogIcon, CloseIcon, GithubIcon, MenuIcon, RssIcon } from "./icons";

export function SiteHeader(this: RenderContext, { site, renderContent }: Pick<TemplateContext, "site"> & { renderContent: RenderContext }): JSX.Element {

    const navLinks = [
        { display: "Posts", href: "/posts/" },
        { display: "Notes", href: "/notes/" },
        { display: "3D Models", href: "/models/" },
    ];

    return (
        <header className="mb-3 sm:mb-9 py-6 select-none">
            <nav className="flex flex-col sm:flex-row" aria-label="Top Navigation">
                <div className="flex-1 flex">
                    <div className="flex items-center me-auto">
                        <BlogIcon className="h-6 w-6 me-3" aria-hidden />
                        <a className="link link-hover text-xl" href="/" aria-label="Home">
                            {site.name}
                        </a>
                    </div>
                    {/* Shown in >= sm */}
                    {navLinks.map(x => (
                        /* Div needed to isolate from sr-only */
                        <div key={x.display} className="me-3">
                            <a className="link sr-only sm:not-sr-only" href={renderContent.url(x.href)}>
                                {x.display}
                            </a>
                        </div>
                    ))}
                    <a className="link link-hover ms-3 hidden md:inline-block" href={renderContent.url("/posts/rss.xml")} rel="noreferrer noopener" target="_blank">
                        <div className="sr-only">RSS Feed</div>
                        <RssIcon className="h-6 w-6" aria-hidden />
                    </a>
                    <a className="link link-hover ms-3 me-14 sm:me-0" href="https://github.com/Silvenga" rel="noreferrer noopener" target="_blank">
                        <div className="sr-only">GitHub Profile</div>
                        <GithubIcon className="h-6 w-6" aria-hidden />
                    </a>
                    <ThemeToggle className="ms-3 hidden sm:block" />
                </div>
                <details className="group sm:hidden relative" aria-hidden>
                    {/* CSS only hamburger menu. I had fun with this one. */}
                    <summary className="list-none absolute right-0 -top-9 w-10 h-10 flex border border-gray-200 p-2 justify-center items-center rounded-md" role="button">
                        <MenuIcon className="h-7 w-7 group-open:hidden" />
                        <CloseIcon className="h-7 w-7 hidden group-open:block" />
                    </summary>
                    <div className="flex flex-col mt-3">
                        {/* Shown in < sm */}
                        {navLinks.map(x => (
                            <div key={x.display} className="mt-2 text-end">
                                <a className="link" href={renderContent.url(x.href)}>
                                    {x.display}
                                </a>
                            </div>
                        ))}
                        <ThemeToggle className="mt-3 self-end" />
                    </div>
                </details>
            </nav>
        </header>
    )
}
