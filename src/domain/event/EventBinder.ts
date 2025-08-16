import { Exception } from "@/shared/errors/Exception";

export class EventBinder {
    private handler?: (...args: any[]) => void;

    constructor(private readonly event: any) {
        if (!event || typeof event.on !== "function") {
            throw new Exception(
                "Invalid event object: must have an .on() method"
            );
        }
    }

    public on(eventName: string, handler: (...args: any[]) => void) {
        this.handler = handler;
        this.event.on(eventName, handler);
        return this;
    }

    public off(eventName: string) {
        if (this.handler && typeof this.event.off === "function") {
            this.event.off(eventName, this.handler);
            this.handler = undefined;
        }
        return this;
    }
}
