import { RenderContext, TemplateContext } from "./eleventy-types";
import { BlogIcon, GithubIcon, RssIcon } from "./icons";

export function Navbar(this: RenderContext, { site, renderContent }: Pick<TemplateContext, "site"> & { renderContent: RenderContext }): JSX.Element {

    const navLinks = [
        { display: "Posts", href: "/posts/" },
        { display: "Notes", href: "/notes/" },
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
