import clsx from "clsx";

export type AvatarProps = {
    className?: string;
}

export function Avatar({ className }: AvatarProps) {
    return (
        <div role="img"
            aria-label="Silvenga's avatar"
            className={clsx("avatar max-w-[192px] h-[192px] w-[100%]", className)} />
    )
}
