import clsx from "clsx";

export type AvatarProps = {
    className?: string;
}

export function Avatar({ className }: AvatarProps) {
    return (
        <img src="/assets/avatar.webp" alt="Silvenga's avatar" className={clsx("w-max h-[192px] aspect-square", className)} />
    )
}
