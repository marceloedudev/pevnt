import Exception from "./Exception";

export default class BadRequestException extends Exception {
    constructor(message: string) {
        super(message, 400, "Bad Request");
    }
}
