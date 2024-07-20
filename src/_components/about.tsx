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
                    <div className="sr-only">Github Profile</div>
                    <GithubIcon className="h-6 w-6" aria-hidden />
                </a>
                <a href="https://slvn.social/@silvenga" target="_blank" rel="me noreferrer noopener" className="me-3">
                    <div className="sr-only">Mastodon Profile</div>
                    <MastodonIcon className="h-6 w-6" aria-hidden />
                </a>
                <a href="https://matrix.to/#/@silvenga:slvn.social" target="_blank" rel="me noreferrer noopener" className="me-3">
                    <div className="sr-only">Matrix Profile</div>
                    <MatrixIcon className="h-6 w-6" aria-hidden />
                </a>
                <a href="https://silvenga.com/resume/" className="me-3" target="_blank" rel="nofollow">
                    <div className="sr-only">My Resume</div>
                    <ResumeIcon className="h-6 w-6" aria-hidden />
                </a>
            </div>
        </div>
    )
}
