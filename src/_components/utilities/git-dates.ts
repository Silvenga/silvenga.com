import spawn from "cross-spawn";

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

// This is all from 11ty, but the exports were removed moving to beta. So just copied and pasted for now.

export function getGitLastUpdatedTimeStamp(filePath: string) {
    const timestamp = (
        parseInt(
            spawn.sync(
                "git",
                // Formats https://www.git-scm.com/docs/git-log#_pretty_formats
                // %at author date, UNIX timestamp
                ["log", "-1", "--format=%at", filePath],
            ).stdout.toString("utf-8"),
        ) * 1000
    );
    if (timestamp) {
        return new Date(timestamp);
    }
}

export function getGitFirstAddedTimeStamp(filePath: string) {
    const timestamp = (
        parseInt(
            spawn
                .sync(
                    "git",
                    // Formats https://www.git-scm.com/docs/git-log#_pretty_formats
                    // %at author date, UNIX timestamp
                    ["log", "--diff-filter=A", "--follow", "-1", "--format=%at", filePath],
                )
                .stdout.toString("utf-8"),
        ) * 1000
    );
    if (timestamp) {
        return new Date(timestamp);
    }
}
