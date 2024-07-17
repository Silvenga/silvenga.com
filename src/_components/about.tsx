import { GithubIcon, MastodonIcon, MatrixIcon, ResumeIcon } from "./icons";

export function About({ className }: { className?: string }) {
    return (
        <div className={className}>
            <p className="mb-0">
                My name is Mark,
            </p>
            <p className="mb-3">
                I love Software Engineering and work with everything from Ceph to Kubernetes. In my free-time I&apos;m learning CAD and enjoying 3D-printing.
            </p>
            <div className="flex lg:justify-start justify-center">
                <a href="https://github.com/Silvenga" target="_blank" rel="me noreferrer noopener" className="me-3">
                    <GithubIcon className="h-6 w-6" />
                </a>
                <a href="https://slvn.social/@silvenga" target="_blank" rel="me noreferrer noopener" className="me-3">
                    <MastodonIcon className="h-6 w-6" />
                </a>
                <a href="https://matrix.to/#/@silvenga:slvn.social" target="_blank" rel="me noreferrer noopener" className="me-3">
                    <MatrixIcon className="h-6 w-6" />
                </a>
                <a href="https://silvenga.com/resume/" className="me-3">
                    <ResumeIcon className="h-6 w-6" />
                </a>
            </div>
        </div>
    )
}
