/* eslint-disable react/jsx-key */

import { ReactNode } from "react";
import { Collection } from "./eleventy-types";
import { ReadableDate } from "./readable-date";
import { groupBy } from "./utilities/group-by";

export type PostsListProps = {
    collection?: Collection;
}

export function PostsList({ collection }: PostsListProps): ReactNode {

    const sortedCollection = collection?.toSorted(({ page: { date: a } }, { page: { date: b } }) => a < b ? 1 : a > b ? -1 : 0) ?? [];
    const groupsByYear = groupBy(sortedCollection, x => x.page.date.getFullYear() + "");
    const sortedKeys = Object.keys(groupsByYear).sort((a, b) => a < b ? 1 : -1)

    return (
        <>
            {sortedKeys.map(key => (
                <section aria-label={`Posts from ${key}`} className="mb-6">
                    <header className="mb-3">
                        <h2 className="text-2xl font-light">{key}</h2>
                    </header>
                    <ul className="list-none" aria-label={`Posts from ${key}`}>
                        {groupsByYear[key].map(({ page, data }) => (
                            <>
                                {!!page.url && data.title && (
                                    <li className="mb-1">
                                        <article className="flex">
                                            <h3 className="grow">
                                                <a href={page.url} className="link font-medium">{data.title}</a>
                                            </h3>
                                            <ReadableDate dateTime={page.date} className="italic ms-auto" />
                                        </article>
                                    </li>
                                )}
                            </>
                        ))}
                    </ul>
                </section>
            ))}
        </>
    )
}
