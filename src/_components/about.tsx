import clsx from "clsx";
import { GithubIcon, MastodonIcon, MatrixIcon, ResumeIcon } from "./icons";

export function About({ className, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
    return (
        <div className={clsx(className)} {...props}>
            <div className="prose leading-relaxed">
                <p className="mb-0">
                    My name is <strong>Mark</strong>, a DevOps fanatic and passionate about crafting beautiful code!
                </p>
                <p className="mb-6">
                    Professionally I'm a software engineer, working with everything from Ceph and Kubernetes to .NET and React.
                    In my free-time I&apos;m learning CAD and enjoying 3D-printing.
                </p>
            </div>
            <SocialLinks />
        </div>
    )
}

function SocialLinks({ className, ...props }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
    return (
        <nav className={clsx("flex lg:justify-start justify-center", className)} aria-label="Social Links" {...props}>
            <a href="https://github.com/Silvenga" target="_blank" rel="me noreferrer noopener" className="me-3">
                <div className="sr-only">Github Profile</div>
                <GithubIcon className="h-6 w-6" aria-hidden />
            </a>
            <a href="https://slvn.social/@silvenga" target="_blank" rel="me noreferrer noopener" className="me-3">
                <div className="sr-only">Mastodon Profile</div>
                <MastodonIcon className="h-6 w-6" aria-hidden />
            </a>
            <a href="/matrix/" rel="nofollow" className="me-3">
                <div className="sr-only">Matrix Profile</div>
                <MatrixIcon className="h-6 w-6" aria-hidden />
            </a>
            <a href="https://silvenga.com/resume/" className="me-3" rel="nofollow">
                <div className="sr-only">My Resume</div>
                <ResumeIcon className="h-6 w-6" aria-hidden />
            </a>
        </nav>
    );
}
