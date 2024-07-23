import { RenderContext } from "./_components/eleventy-types";
import { Avatar, MatrixIcon } from "./_components/icons";

export function data() {
    return {
        title: "Matrix",
        description: "My matrix address.",
        noIndex: true
    }
}

export function render(this: RenderContext) {
    return (
        <article className="text-center sm:mt-12">
            <section className="border rounded-lg p-6 flex justify-center">
                <section className="basis-1/3 border-r pe-3 sm:block hidden">
                    <Avatar className="mb-3" />
                </section>
                <section className="sm:basis-2/3 sm:ps-3 flex flex-col justify-center">
                    <div className="flex items-center justify-center mb-3">
                        <MatrixIcon className="w-9 h-9" aria-hidden />
                    </div>
                    <p className="mb-6">
                        I use Matrix, let me know if you want to chat!
                    </p>
                    <div className="flex mx-6 mb-3">
                        <a className="grow px-3 py-2 bg-gray-200 dark:bg-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors border rounded-lg me-3"
                            role="button"
                            target="_blank"
                            rel="nofollow"
                            href="https://matrix.to/#/@silvenga:slvn.social">
                            matrix.to
                        </a>
                        <a className="grow px-3 py-2 bg-gray-200 dark:bg-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors border rounded-lg"
                            role="button"
                            target="_blank"
                            rel="nofollow"
                            href="matrix://@silvenga:slvn.social">
                            matrix://
                        </a>
                    </div>
                    <div className="text-sm border-t mt-3 pt-3 mx-12">
                        <span className="font-medium text-black dark:text-white">@silvenga</span><span className="opacity-65">:slvn.social</span>
                    </div>
                </section>
            </section>
            <div className="hidden" aria-hidden>
                <a rel="me nofollow" href="https://slvn.social/@silvenga"></a>
            </div>
        </article>
    );
}
