import { Fragment, ReactNode } from "react";
import { Collection } from "./eleventy-types";
import { ReadableDate } from "./readable-date";
import { groupBy } from "./utilities/group-by";

export type PostsListProps = {
    collection?: Collection;
    archived?: boolean;
    drafts?: boolean;
}

export function PostsList({ collection, archived, drafts }: PostsListProps): ReactNode {

    const filteredCollection = collection?.filter(x => {
        if (archived) {
            return !!x.data.archived;
        }
        if (drafts) {
            return !!x.data.draft;
        }
        return !x.data.archived && !x.data.draft;
    })

    const sortedCollection = filteredCollection?.toSorted(({ data: { created: a } }, { data: { created: b } }) => a < b ? 1 : a > b ? -1 : 0) ?? [];
    const groupsByYear = groupBy(sortedCollection, x => x.data.created?.getFullYear() + "");
    const sortedKeys = Object.keys(groupsByYear).sort((a, b) => a < b ? 1 : -1)

    return (
        <>
            {sortedKeys.map(key => (
                <section key={key} aria-label={`Posts from ${key}`} className="mb-6">
                    <header className="mb-3">
                        <h2 className="text-2xl font-light">{key}</h2>
                    </header>
                    <ul className="list-none" aria-label={`Posts from ${key}`}>
                        {groupsByYear[key].map(({ page, data }) => (
                            <Fragment key={page.inputPath}>
                                {!!page.url && data.title && (
                                    <li className="mb-1">
                                        <article className="flex">
                                            <h3 className="">
                                                <a href={page.url} className="link font-medium">{data.title}</a>
                                            </h3>
                                            <ReadableDate dateTime={data.created} className="italic grow text-end text-nowrap ps-3" />
                                        </article>
                                    </li>
                                )}
                            </Fragment>
                        ))}
                    </ul>
                </section>
            ))}
        </>
    )
}
