import getGitFirstAddedTimeStamp from "@11ty/eleventy/src/Util/DateGitFirstAdded";
import getGitLastUpdatedTimeStamp from "@11ty/eleventy/src/Util/DateGitLastUpdated";
import { TemplateContext } from "../../_components/eleventy-types";
import { RootLayout } from "../../_components/layouts/root-layout";

export const render = RootLayout;

export function data() {
    return {
        eleventyComputed: {
            created: function (this: void, content: TemplateContext): Date {
                return ifAllowedOrDefault(
                    () => content["date"]
                        ? content.page.date
                        : getGitFirstAddedTimeStamp(content.page.inputPath)
                        ?? content.page.date,
                    content.page.date
                );
            },
            updated: function (this: void, content: TemplateContext): Date {
                return ifAllowedOrDefault(
                    () => getGitLastUpdatedTimeStamp(content.page.inputPath)
                        ?? content.created,
                    content.page.date
                );
            }
        }
    }
}

function ifAllowedOrDefault<T>(func: () => T, def: T) {
    // Use a fake date in dev mode, avoids invoking git for every file twice.
    return process.env["SUPPRESS_GIT"] == "1"
        ? def
        : func();
}
