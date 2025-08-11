import Exception from "./Exception";

export default class NotFoundException extends Exception {
    constructor(message: string) {
        super(message, 400, "Not Found");
    }
}
