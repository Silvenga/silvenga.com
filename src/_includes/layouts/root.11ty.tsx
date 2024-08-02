import { TemplateContext } from "../../_components/eleventy-types";
import { RootLayout } from "../../_components/layouts/root-layout";
import { ProcessCache } from "../../_components/utilities/cache";
import { getGitFirstAddedTimeStamp, getGitLastUpdatedTimeStamp } from "../../_components/utilities/git-dates";

export const render = RootLayout;

export function data() {
    return {
        eleventyComputed: {
            created: function (this: void, content: TemplateContext): Date {
                return ProcessCache.createOrGet(
                    "created:" + content.page.inputPath,
                    () => ifAllowedOrDefault(() => {
                        console.log(`Calculating created date for ${content.page.inputPath}.`);
                        return content["date"]
                            ? content.page.date
                            : getGitFirstAddedTimeStamp(content.page.inputPath)
                            ?? content.page.date
                    }, content.page.date)
                );
            },
            updated: function (this: void, content: TemplateContext): Date {
                return ProcessCache.createOrGet(
                    "updated:" + content.page.inputPath,
                    () => ifAllowedOrDefault(() => {
                        console.log(`Calculating updated date for ${content.page.inputPath}.`);
                        return getGitLastUpdatedTimeStamp(content.page.inputPath)
                            ?? content.created;
                    }, content.page.date)
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
