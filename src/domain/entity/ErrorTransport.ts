export interface SerializedError {
    message: string;
    stack?: string;
    file?: string;
    line?: string;
    column?: string;
}

export class ErrorTransport {
    public serialize(err: Error): SerializedError {
        const stack = err.stack || "";
        const lines = stack.split("\n");

        const match = lines[1]?.match(/\((.*):(\d+):(\d+)\)/);

        return {
            message: err.message,
            stack,
            file: match?.[1],
            line: match?.[2],
            column: match?.[3],
        };
    }

    public rebuild(data: SerializedError): Error {
        const err = new Error(data.message);
        err.stack = data.stack;
        return err;
    }
}
