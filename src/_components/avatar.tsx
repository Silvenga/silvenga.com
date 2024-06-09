import clsx from "clsx";

export type AvatarProps = {
    className?: string;
}

export function Avatar({ className }: AvatarProps) {
    return (
        <img src="/src/assets/avatar.webp" className={clsx("max-w-48 h-[192px] aspect-square", className)} />
    )
}
