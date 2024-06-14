import { CollectionApi } from "@11ty/eleventy";
import { CollectionItem } from "./eleventy-types";

export type RedirectItem = {
    canonicalItem: CollectionItem;
    canonicalPermLink: string;
    aliasPermLink: string;
}

export function redirectsCollectionFactory(collectionApi: CollectionApi): RedirectItem[] {
    const redirects: RedirectItem[] = [];
    for (const canonicalItem of collectionApi.getAll<CollectionItem>()) {

        const canonicalPermLink = canonicalItem.page.url;
        if (canonicalPermLink && canonicalItem.data.aliases) {

            // Handle aliases as an array or a string;
            const aliases = Array.isArray(canonicalItem.data.aliases)
                ? canonicalItem.data.aliases
                : [canonicalItem.data.aliases]

            for (const aliasPermLink of aliases) {
                redirects.push({
                    aliasPermLink,
                    canonicalPermLink,
                    canonicalItem
                });
            }
        }
    }
    return redirects;
}
