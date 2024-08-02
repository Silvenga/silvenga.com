import { DateTime } from "luxon";
import { RenderContext, TemplateContext } from "./_components/eleventy-types";
import { HeartIcon, ModelIcon, PrintablesIcon, PrinterIcon } from "./_components/icons";
import { PrintableModel, getModelById } from "./_components/pritables/client";

export function data() {
    return {
        title: "3D Models",
        description: "My 3D-Printing models I've made over the years.",
        printablesModelIds: [
            "879617", // Fun-Sized Master Spool (Parametric)
            "892912", // EIBOS Cyclopes Accessories
            "559194", // Zigbee Door Sensor Mount
            "560184", // CyberPower Surge Protector Mount/Bracket
            "611393", // Disposable Gloves Dispenser
            "642336", // YAS - Yet Another Bed Scraper
        ],
        eleventyComputed: {
            printableModels: async ({ printablesModelIds }: { printablesModelIds: string[] }) => {
                const models: PrintableModel[] = [];
                for (const id of printablesModelIds) {
                    const model = await getModelById(id);
                    models.push(model);
                }
                return models;
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
            {printableModels.map(x => (
                <Model key={x.id} model={x} />
            ))}
            <footer className="pt-6">
                <p className="text-center text-gray-600">
                    Printable.com statistics updated on {DateTime.utc().toFormat("yyyy-LL-dd")}
                </p>
            </footer>
        </article>
    );
}

function Model({ model }: { model: PrintableModel }) {

    const link = `https://www.printables.com/model/${model.id}-${model.slug}`;

    return (
        <section className="rounded mb-9 border border-gray-300 dark:bg-gray-800">

            <header>
                <h2 className="text-3xl font-light p-6 flex items-center">
                    <ModelIcon className="me-3 h-8 w-8" />
                    {model.name}
                </h2>
            </header>

            <div className="flex flex-col-reverse lg:flex-row border-t border-b">
                <div className="basis-2/5">
                    <img className="object-cover w-full h-auto lightbox-subject"
                        src={`https://media.printables.com/${model.image.filePath}`}
                        alt="Model preview." />
                </div>
                <div className="flex flex-col p-6 basis-3/5 grow-0">
                    <p className="mb-3 grow">
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
