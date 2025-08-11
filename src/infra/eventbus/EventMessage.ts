import EventMessageIPC from "./ipc/EventMessageIPC";
import EventMessageMemory from "./memory/EventMessageMemory";
import EventMessageWorker from "./worker/EventMessageWorker";
import IEventMessage from "@/domain/eventbus/IEventMessage";

export default class EventMessage {
    public create(): IEventMessage {
        if (process.env.NODE_ENV === "test") {
            return new EventMessageMemory();
        } else {
            const eventMessageIPC = new EventMessageIPC();
            const eventMessageWorker = new EventMessageWorker();
            if (eventMessageWorker.isEvent()) {
                return eventMessageWorker;
            } else if (eventMessageIPC.isEvent()) {
                return eventMessageIPC;
            }
            throw new Error("Invalid event");
        }
    }
}
