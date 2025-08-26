import { ConsumerHandlerIPC } from "../ipc/ConsumerHandlerIPC";
import { ConsumerHandlerMemory } from "../memory/ConsumerHandlerMemory";
import { ConsumerHandlerWorker } from "../worker/ConsumerHandlerWorker";
import { EventMessageIPC } from "../ipc/EventMessageIPC";
import { EventMessageMemory } from "../memory/EventMessageMemory";
import { EventMessageWorker } from "../worker/EventMessageWorker";
import { Exception } from "@/shared/errors/Exception";
import { IEventMessage } from "@/shared/interfaces/IEventMessage";
import { IMessageConsumerBase } from "@/shared/interfaces/IMessageConsumerBase";
import { InMemoryDatabase } from "@/infra/database/InMemoryDatabase";
import { TransportType } from "@/shared/enums/TransportType";

export class MessageFactory {
    private database: InMemoryDatabase;

    constructor() {
        this.database = InMemoryDatabase.getInstance();
    }

    public createEventMessage(): IEventMessage {
        if (this.database.getTransport() === TransportType.MEMORY) {
            return new EventMessageMemory();
        } else {
            const eventMessageIPC = new EventMessageIPC();
            const eventMessageWorker = new EventMessageWorker();
            if (eventMessageWorker.isEvent()) {
                return eventMessageWorker;
            } else if (eventMessageIPC.isEvent()) {
                return eventMessageIPC;
            }
            throw new Exception("Invalid event");
        }
    }

    public createMessageConsumer(
        transport: TransportType
    ): IMessageConsumerBase {
        if (transport === TransportType.WORKER) {
            return new ConsumerHandlerWorker();
        } else if (transport === TransportType.PROCESS) {
            return new ConsumerHandlerIPC();
        } else if (transport === TransportType.MEMORY) {
            return new ConsumerHandlerMemory();
        }
        throw new Exception("Invalid consumer");
    }
}
