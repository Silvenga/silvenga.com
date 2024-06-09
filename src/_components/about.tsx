import { GithubIcon, MastodonIcon } from "./icons";

export function About() {
    return (
        <div aria-label="About me" className="pose">
            <p className="mb-0">
                My name is Mark,
            </p>
            <p className="mb-3">
                I love Software Engineering and work with everything from Ceph to Kubernetes. In my free-time I&apos;m learning CAD and enjoying 3D-printing.
            </p>
            <div aria-label="Social links" className="flex lg:justify-start justify-center">
                <a href="https://github.com/Silvenga" target="_blank" rel="noreferrer noopener" className="me-3">
                    <div className="h-6 w-6 aspect-square">
                        <GithubIcon />
                    </div>
                </a>
                <a href="https://slvn.social/@silvenga" target="_blank" rel="noreferrer noopener" className="me-3">
                    <div className="h-6 w-6 aspect-square">
                        <MastodonIcon />
                    </div>
                </a>
            </div>
        </div>
    )
}
