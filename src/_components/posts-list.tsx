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
                <Fragment key={key}>
                    <h2 className="text-2xl font-light mb-3" aria-hidden>{key}</h2>
                    <ul className="list-none mb-6" aria-label={`Posts from ${key}`}>
                        {groupsByYear[key].map(({ page, data }) => (
                            <Fragment key={page.inputPath}>
                                {!!page.url && !!data.title && (
                                    <li className="mb-1 flex">
                                        <a href={page.url} className="link font-medium">
                                            {data.title}
                                        </a>
                                        <span className="sr-only">From</span>
                                        <ReadableDate dateTime={data.created} className="italic grow text-end text-nowrap ps-3" />
                                    </li>
                                )}
                            </Fragment>
                        ))}
                    </ul>
                </Fragment>
            ))}
        </>
    )
}
