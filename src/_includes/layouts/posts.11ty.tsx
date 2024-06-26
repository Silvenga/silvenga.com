import { PostsLayout } from "../../_components/layouts/posts-layout";

export const render = PostsLayout;

export function data() {
    return {
        layout: "root",
        type: "article",
        author: "Mark (Silvenga)"
    }
}
