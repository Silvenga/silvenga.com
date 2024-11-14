import { DateTime } from "luxon";
import { RenderContext, TemplateContext } from "./_components/eleventy-types";
import { HeartIcon, ModelIcon, PrintablesIcon, PrinterIcon } from "./_components/icons";
import { PrintableModel, getModelById, getUserModelsByUserId } from "./_components/printables/client";

export function data() {
    return {
        title: "3D Models",
        description: "My 3D-Printing models I've made over the years.",
        printablesUserId: "@Silvenga",
        eleventyComputed: {
            printableModels: async ({ printablesUserId }: { printablesUserId: string }) => {
                const printablesModelIds = await getUserModelsByUserId(printablesUserId);
                const models: PrintableModel[] = [];
                for (const id of printablesModelIds) {
                    const model = await getModelById(id);
                    models.push(model);
                }
                return models.toSorted((a, b) => b.likesCount - a.likesCount);
            }
        }
    }
}

export function render(this: RenderContext, { printableModels }: TemplateContext & { printableModels: PrintableModel[] }) {
    return (
        <article>
            <header className="mb-9">
                <h1 className="title mb-3">3D Models</h1>
                <p>
                    These some of the models I've made over the years as I learn Fusion 360 in my spare time.
                </p>
            </header>
            <div className="md:w-[calc(680px*2)] md:ms-[calc(680px/-2)]">
                <div className="w-screen max-w-full mx-auto md:px-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {printableModels.map(x => (
                        <Model key={x.id} model={x} />
                    ))}
                </div>
            </div>
            <footer className="pt-12">
                <p className="text-center text-gray-600">
                    Printable.com statistics cached. Last updated on {DateTime.utc().toFormat("yyyy-LL-dd")}.
                </p>
            </footer>
        </article>
    );
}

function Model({ model }: { model: PrintableModel }) {

    const link = `https://www.printables.com/model/${model.id}-${model.slug}`;

    return (
        <section className="rounded border border-gray-300 dark:bg-gray-800 flex flex-col justify-between">

            <header>
                <h2 className="text-xl md:text-2xl lg:text-3xl font-light p-6 flex items-center">
                    <ModelIcon className="me-3 h-8 w-8 shrink-0" />
                    <span className="line-clamp-2">{model.name}</span>
                </h2>
            </header>

            <div className="flex flex-col-reverse md:flex-row">
                <div className="basis-2/5 p-3">
                    <img className="object-cover w-full h-auto lightbox-subject rounded-md"
                        src={`https://media.printables.com/${model.image.filePath}`}
                        alt="Model preview"
                        {...{ "eleventy:widths": "512" }}
                    />
                </div>
                <div className="flex flex-col p-6 basis-3/5 grow-0">
                    <p className="mb-3 grow prose dark:prose-invert max-w-none">
                        {model.summary}
                    </p>
                    <ul className="list-none flex flex-wrap h-12 overflow-hidden grow-0 text-sm text-gray-600 dark:text-gray-300" aria-hidden>
                        {model.tags.map(({ name }) => (
                            <li key={name} className="mr-3 border rounded-full p-2 mb-3">
                                #{name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <footer className="p-3 flex">

                <div className="grow flex justify-end items-center text-gray-500 dark:text-gray-200 text-sm">
                    <div className="flex items-center me-6" title={`${model.likesCount} total likes`}>
                        <HeartIcon className="me-2 h-4 w-4 bg-gray-500 dark:bg-gray-200" aria-hidden />
                        {model.likesCount}
                        <span className="sr-only"> likes</span>
                    </div>
                    <div className="flex items-center me-6" title={`${model.makesCount} total makes`}>
                        <PrinterIcon className="me-2 h-4 w-4 bg-gray-500 dark:bg-gray-200" aria-hidden />
                        {model.makesCount}
                        <span className="sr-only"> makes</span>
                    </div>
                </div>

                <a className="p-3 border border-[#fa6831] bg-[#fa6831] hover:bg-[#f1551d] text-white rounded flex items-center justify-center"
                    rel="noreferrer noopener nofollow external"
                    target="_blank"
                    role="button"
                    href={link}>
                    <PrintablesIcon className="icon me-2 h-6 w-6" />
                    View on Printables
                </a>

            </footer>

        </section>
    )
}
