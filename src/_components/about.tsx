import clsx from "clsx";
import { GithubIcon, MastodonIcon } from "./icons";

export function About({ className }: { className?: string }) {
    return (
        <div className={clsx("pose", className)}>
            <p className="mb-0">
                My name is Mark,
            </p>
            <p className="mb-3">
                I love Software Engineering and work with everything from Ceph to Kubernetes. In my free-time I&apos;m learning CAD and enjoying 3D-printing.
            </p>
            <div className="flex lg:justify-start justify-center">
                <a href="https://github.com/Silvenga" target="_blank" rel="noreferrer noopener" className="me-3">
                    <GithubIcon className="h-6 w-6 aspect-square" />
                </a>
                <a href="https://slvn.social/@silvenga" target="_blank" rel="noreferrer noopener" className="me-3">
                    <MastodonIcon className="h-6 w-6 aspect-square" />
                </a>
            </div>
        </div>
    )
}
