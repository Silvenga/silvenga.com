import { DateTime } from "luxon";

export type ReadableDateProps = {
    dateTime?: Date;
    className?: string;
}

export function ReadableDate(props: ReadableDateProps) {
    if (!props.dateTime) {
        return <span className={props.className} aria-label="No Date">-</span>
    }

    const dateTime = DateTime.fromJSDate(props.dateTime);

    if (!dateTime.isValid) {
        throw new Error("Failed to handle JS Date, this shouldn't be possible.");
    }

    return (
        <time className={props.className} dateTime={dateTime.toISODate()} title={dateTime.toISODate()}>
            {dateTime.toFormat("LLLL d, yyyy")}
        </time>
    )
}
