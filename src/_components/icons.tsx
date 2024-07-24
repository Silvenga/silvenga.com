import clsx from "clsx";

export type IconProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export function Avatar({ className, ...props }: IconProps) {
    return (
        <div role="img"
            aria-label="Silvenga's avatar"
            className={clsx("avatar max-w-[192px] h-[192px] w-[100%]", className)}
            {...props} />
    )
}

export function GithubIcon({ className, ...props }: IconProps) {
    return (
        <div role="img"
            title="GitHub"
            aria-label="Github icon"
            className={clsx("github-icon", className)}
            {...props} />
    );
}

export function MastodonIcon({ className, ...props }: IconProps) {
    return (
        <div role="img"
            title="Mastodon"
            aria-label="Mastodon icon"
            className={clsx("mastodon-icon", className)}
            {...props} />
    );
}

export function RssIcon({ className, ...props }: IconProps) {
    return (
        <div role="img"
            title="RSS"
            aria-label="Rss icon"
            className={clsx("rss-icon", className)}
            {...props} />
    );
}

export function BlogIcon({ className, ...props }: IconProps) {
    return (
        <div role="img"
            aria-label="Blog icon"
            className={clsx("blog-icon", className)}
            {...props} />
    );
}

export function PrintablesIcon({ className, ...props }: IconProps) {
    return (
        <div role="img"
            title="Printables.com"
            aria-label="Printables.com icon"
            className={clsx("printables-icon", className)}
            {...props} />
    );
}

export function HeartIcon({ className, ...props }: IconProps) {
    return (
        <div role="img"
            aria-label="Heart icon"
            className={clsx("heart-icon", className)}
            {...props} />
    );
}

export function PrinterIcon({ className, ...props }: IconProps) {
    return (
        <div role="img"
            aria-label="Traditional printer icon"
            className={clsx("printer-icon", className)}
            {...props} />
    );
}

export function ModelIcon({ className, ...props }: IconProps) {
    return (
        <div role="img"
            aria-label="3D model icon"
            className={clsx("model-icon", className)}
            {...props} />
    );
}

export function MatrixIcon({ className, ...props }: IconProps) {
    return (
        <div role="img"
            title="Matrix"
            aria-label="Matrix icon"
            className={clsx("matrix-icon", className)}
            {...props} />
    );
}

export function CcIcon({ className, ...props }: IconProps) {
    return (
        <div role="img"
            title="Creative Common License"
            aria-label="Creative Commons license icon"
            className={clsx("cc-icon", className)}
            {...props} />
    );
}

export function CcByIcon({ className, ...props }: IconProps) {
    return (
        <div role="img"
            title="Creative Common Attribution"
            aria-label="Creative Commons attribution icon"
            className={clsx("cc-by-icon", className)}
            {...props} />
    );
}

export function CcSaIcon({ className, ...props }: IconProps) {
    return (
        <div role="img"
            title="Creative Common Share-Alike"
            aria-label="Creative Commons share-alike icon"
            className={clsx("cc-sa-icon", className)}
            {...props} />
    );
}

export function ResumeIcon({ className, ...props }: IconProps) {
    return (
        <div role="img"
            title="Resume"
            aria-label="Resume icon"
            className={clsx("resume-icon", className)}
            {...props} />
    );
}

export function MenuIcon({ className, ...props }: IconProps) {
    return (
        <div role="img"
            title="Menu"
            aria-label="Menu icon"
            className={clsx("menu-icon", className)}
            {...props} />
    );
}

export function CloseIcon({ className, ...props }: IconProps) {
    return (
        <div role="img"
            title="Close"
            aria-label="Close icon"
            className={clsx("close-icon", className)}
            {...props} />
    );
}
