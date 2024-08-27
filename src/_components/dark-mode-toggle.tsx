import clsx from "clsx";

export type ThemeToggleProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export function ThemeToggle({ className, ...props }: ThemeToggleProps) {
    return (
        <div className={clsx("theme-toggle", className)}
            role="button"
            aria-hidden
            {...props}>

            <div className="toggle-handle" />
            <div className="toggle-icon toggle-start" />
            <div className="toggle-icon toggle-end" />

            <noscript>
                <style dangerouslySetInnerHTML={{ __html: ".theme-toggle { display: none; }" }}></style>
            </noscript>
        </div>
    )
}
