import { ConsumerHandlerIPC } from "../ipc/ConsumerHandlerIPC";
import { ConsumerHandlerMemory } from "../memory/ConsumerHandlerMemory";
import { ConsumerHandlerWorker } from "../worker/ConsumerHandlerWorker";
import { EventMessageIPC } from "../ipc/EventMessageIPC";
import { EventMessageMemory } from "../memory/EventMessageMemory";
import { EventMessageWorker } from "../worker/EventMessageWorker";
import { IEventMessage } from "@/shared/interfaces/IEventMessage";
import { IMessageConsumerBase } from "@/shared/interfaces/IMessageConsumerBase";
import { ITransportType } from "@/shared/interfaces/ITransportType";

export class MessageFactory {
    public createEventMessage(): IEventMessage {
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

    public createMessageConsumer(
        transport: ITransportType
    ): IMessageConsumerBase {
        if (process.env.NODE_ENV === "test") {
            return new ConsumerHandlerMemory();
        } else {
            if (transport === ITransportType.WORKER) {
                return new ConsumerHandlerWorker();
            } else if (transport === ITransportType.PROCESS) {
                return new ConsumerHandlerIPC();
            }
            throw new Error("Invalid consumer");
        }
    }
}
