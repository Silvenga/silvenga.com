import getGitLastUpdatedTimeStamp from "@11ty/eleventy/src/Util/DateGitLastUpdated";
import { TemplateContext } from "../../_components/eleventy-types";
import { PostsLayout } from "../../_components/layouts/posts-layout";

export const render = PostsLayout;

export function data() {
    return {
        layout: "root",
        type: "article",
        author: "Mark (Silvenga)",
        eleventyComputed: {
            created: function (content: TemplateContext): Date {
                return content.page.date;
            },
            updated: function (content: TemplateContext): Date {
                return getGitLastUpdatedTimeStamp(content.page.inputPath) ?? content.page.date;
            }
        }
    }
}
