import {
    IEventPayload,
    IEventResponseType,
} from "@/domain/eventbus/IEventResponseType";

import EventBinder from "@/domain/event/EventBinder";
import IEventMessage from "@/domain/eventbus/IEventMessage";
import { randomUUID as uuid } from "node:crypto";

export default class EventMessageIPC implements IEventMessage {
    public isEvent(): boolean {
        return !!process?.send;
    }

    public async sendEventAndReturn<T>(
        payload: IEventPayload | null | undefined = undefined,
        type?: string
    ) {
        if (!this.isEvent()) {
            throw new Error("IPC channel not available");
        }
        const eventBinder = new EventBinder(process);
        try {
            const res = await new Promise((resolve, reject) => {
                const id = uuid();
                process?.send?.({
                    id,
                    type,
                    ...payload,
                });
                const listener = async (
                    res: IEventResponseType | null | undefined
                ) => {
                    if (res) {
                        const {
                            error,
                            data,
                            type: eventType,
                            id: eventId,
                        }: IEventResponseType = res;
                        if (
                            (type && eventType === type && eventId === id) ||
                            (!type && eventId === id)
                        ) {
                            return error ? reject(error) : resolve(data as T);
                        }
                        return reject("Not found IPC response");
                    }
                };
                eventBinder.on("message", listener);
            });
            eventBinder.off("message");
            return res;
        } catch (error) {
            eventBinder.off("message");
            throw error;
        }
    }
}
