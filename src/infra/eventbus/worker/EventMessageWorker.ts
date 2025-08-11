import {
    IEventPayload,
    IEventResponseType,
} from "@/domain/eventbus/IEventResponseType";

import EventBinder from "@/domain/event/EventBinder";
import IEventMessage from "@/domain/eventbus/IEventMessage";
import { parentPort } from "node:worker_threads";
import { randomUUID as uuid } from "node:crypto";

export default class EventMessageWorker implements IEventMessage {
    public isEvent(): boolean {
        return parentPort !== null;
    }

    public async sendEventAndReturn<T>(
        payload: IEventPayload | null | undefined = undefined,
        type?: string
    ): Promise<any> {
        if (!this.isEvent()) {
            throw new Error("Worker threads not available");
        }
        const eventBinder = new EventBinder(parentPort);
        try {
            const res = await new Promise((resolve, reject) => {
                const id = uuid();
                parentPort?.postMessage({
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
                        return reject("Not found Worker response");
                    }
                };
                eventBinder?.on("message", listener);
            });
            eventBinder.off("message");
            return res;
        } catch (error) {
            eventBinder.off("message");
            throw error;
        }
    }
}
