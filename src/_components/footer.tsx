export function Footer(): JSX.Element {
    const year = new Date().getFullYear();
    return (
        <footer className="py-9 flex flex-col justify-center items-center mt-auto">
            <div className="text-center">
                Copyright © {year}. Built with <span className="text-[#ad4d4d] dark:text-[#deabab]">&#x2764;&#xfe0e;</span> by Silvenga
            </div>
            <div className="text-center">
                Metrics gathered by Umami, privacy-focused-analytics. No cookies are saved.
            </div>
            <div className="text-center">
                <a className="link link-hover" href="https://github.com/Silvenga/silvenga.com" rel="noreferrer noopener" target="_blank">[Source Code]</a>
            </div>
        </footer>
    )
}
