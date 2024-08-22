import EleventyFetch from "@11ty/eleventy-fetch";

export async function getModelById(id: string): Promise<PrintableModel> {
    const request = getModelByIdQuery(id);
    const response = await EleventyFetch<ModelById>(`https://api.printables.com/graphql/?cache-break=${id}`, {
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
