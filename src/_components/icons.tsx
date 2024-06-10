import clsx from "clsx";

export function GithubIcon({ className }: { className?: string }) {
    return (
        <div role="img"
            aria-label="Github icon"
            className={clsx("github-icon", className)} />
    );
}

export function MastodonIcon({ className }: { className?: string }) {
    return (
        <div role="img"
            aria-label="Mastodon icon"
            className={clsx("mastodon-icon", className)} />
    );
}

export function RssIcon({ className }: { className?: string }) {
    return (
        <div role="img"
            aria-label="Rss icon"
            className={clsx("rss-icon", className)} />
    );
}

export function BlogIcon({ className }: { className?: string }) {
    return (
        <div role="img"
            aria-label="Blog icon"
            className={clsx("blog-icon", className)} />
    );
}
