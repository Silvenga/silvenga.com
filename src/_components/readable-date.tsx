import { DateTime } from "luxon";

export type ReadableDateProps = {
    dateTime: Date;
    className?: string;
}

export function ReadableDate(props: ReadableDateProps) {
    const dateTime = DateTime.fromJSDate(props.dateTime);
    return (
        <time className={props.className} dateTime={dateTime.toISODate()} title={dateTime.toISODate()}>
            {dateTime.toFormat("LLLL d, yyyy")}
        </time>
    )
}
