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

export function PrintablesIcon({ className }: { className?: string }) {
    return (
        <div role="img"
            aria-label="Printables.com icon"
            className={clsx("printables-icon", className)} />
    );
}

export function HeartIcon({ className, ariaHidden }: { className?: string, ariaHidden?: boolean }) {
    return (
        <div role="img"
            aria-label="Heart icon"
            aria-hidden={ariaHidden}
            className={clsx("heart-icon", className)} />
    );
}

export function PrinterIcon({ className, ariaHidden }: { className?: string, ariaHidden?: boolean }) {
    return (
        <div role="img"
            aria-label="Traditional printer icon"
            aria-hidden={ariaHidden}
            className={clsx("printer-icon", className)} />
    );
}

export function ModelIcon({ className, ariaHidden }: { className?: string, ariaHidden?: boolean }) {
    return (
        <div role="img"
            aria-label="3D model icon"
            aria-hidden={ariaHidden}
            className={clsx("model-icon", className)} />
    );
}
