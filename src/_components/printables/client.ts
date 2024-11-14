import EleventyFetch from "@11ty/eleventy-fetch";

export async function getModelById(id: string): Promise<PrintableModel> {
    const request = getModelByIdQuery(id);
    const response = await EleventyFetch<ModelById>(`https://api.printables.com/graphql/?cache-break=${id}&type=model`, {
        type: "json",
        duration: "1w",
        fetchOptions: {
            method: "POST",
            body: JSON.stringify(request),
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "11ty (silvenga.com)"
            }
        }
    });

    return response.data.print;
}

function getModelByIdQuery(id: string) {
    return {
        "operationName": "PrintProfile",
        "variables": {
            "id": id,
        },
        query: `
            query PrintProfile($id: ID!) {
                print(id: $id) {
                    id
                    slug
                    name
                    # ratingAvg
                    # ratingCount
                    # description
                    modified
                    datePublished
                    summary
                    likesCount
                    makesCount
                    # downloadCount
                    privateCollectionsCount
                    publicCollectionsCount
                    commentCount
                    image {
                        filePath
                    }
                    images {
                        filePath
                    }
                    tags {
                        name
                    }
                }
            }
        `
    }
}

type ModelById = {
    data: {
        print: PrintableModel
    }
}

export type PrintableModel = {
    id: string
    slug: string
    name: string
    modified: string
    datePublished: string
    summary: string
    likesCount: number
    makesCount: number
    privateCollectionsCount: number
    publicCollectionsCount: number
    commentCount: number
    image: { filePath: string }
    images: { filePath: string }[]
    tags: { name: string }[]
}

export async function getUserModelsByUserId(userId: string): Promise<string[]> {
    const request = getUserModelsByUserIdQuery(userId);
    const response = await EleventyFetch<UsersModelsByUserId>(`https://api.printables.com/graphql/?cache-break=${userId}&type=user-models`, {
        type: "json",
        duration: "1w",
        fetchOptions: {
            method: "POST",
            body: JSON.stringify(request),
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "11ty (silvenga.com)"
            }
        }
    });

    if (response.data.userModels.cursor) {
        throw new Error("Cursor was returned, assuming the result was truncated. This isn't currently supported.");
    }

    return response.data.userModels.items.map(x => x.id);
}

function getUserModelsByUserIdQuery(userId: string, cursor: string | null = null, limit = 100, ordering = "-first_publish") {
    return {
        operationName: "UserModels",
        variables: {
            "id": userId,
            "cursor": cursor,
            "limit": limit,
            "ordering": ordering,
        },
        query: `
            query UserModels($id: ID!, $limit: Int!, $cursor: String, $ordering: String) {
                userModels(userId: $id, cursor: $cursor, limit: $limit, ordering: $ordering) {
                    cursor
                    items {
                        ...Model
                    }
                }
            }

            fragment Model on PrintType {
                id
            }
        `
    }
}

type UsersModelsByUserId = {
    data: {
        userModels: {
            cursor: string,
            items: { id: string }[]
        }
    }
}
