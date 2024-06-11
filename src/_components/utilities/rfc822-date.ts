export function formatAsRfc822Date(date: Date) {
    return pubDateRFC822(date);
}

// https://github.com/11ty/eleventy-plugin-rss/blob/master/src/dateRfc822.js
function pubDateRFC822(date: Date) {
    const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",

        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,

        timeZoneName: "short",
    };

    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
    const [wkd, mmm, dd, yyyy, time, z] = formattedDate.replace(/([,\s+\\-]+)/g, " ").split(" ");
    const tz = `${z}`.replace(/UTC/, "GMT");

    return `${wkd}, ${dd} ${mmm} ${yyyy} ${time} ${tz}`;
}
