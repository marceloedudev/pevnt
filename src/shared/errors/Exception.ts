export class Exception extends Error {
    constructor(
        readonly message: string,
        readonly timestamp: Date = new Date()
    ) {
        super(message);
    }
}
