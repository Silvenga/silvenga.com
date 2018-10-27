export class Logger {
    public info(message: any, ...params: any[]) {
        // tslint:disable-next-line:no-console
        console.log(message, ...params);
    }
    public warn(message: any, ...params: any[]) {
        // tslint:disable-next-line:no-console
        console.warn(message, ...params);
    }
}

export const logger = new Logger();