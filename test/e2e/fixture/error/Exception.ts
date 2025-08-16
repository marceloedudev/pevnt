export class Exception extends Error {
    public timestamp: Date;

    constructor(
        readonly message: string,
        readonly code: number,
        readonly error: string,
        timestamp?: Date
    ) {
        super(message);
        this.timestamp = timestamp ?? new Date();
    }
}
