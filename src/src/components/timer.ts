export class Timer {

    private _startTime: number;

    public get supported(): boolean {
        return "performance" in window == true;
    }

    public start(): void {
        if (this.supported) {
            this._startTime = window.performance.now();
        }
    }

    public stop(): number {
        if (this.supported) {
            let endTime = window.performance.now();
            return endTime - this._startTime;
        } else {
            return 0;
        }
    }
}