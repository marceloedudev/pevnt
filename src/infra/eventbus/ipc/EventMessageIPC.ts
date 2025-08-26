import {
    IEventPayload,
    IEventResponseType,
} from "@/shared/interfaces/IEventResponseType";

import { ErrorTransport } from "@/domain/entity/ErrorTransport";
import { EventBinder } from "@/domain/event/EventBinder";
import { Exception } from "@/shared/errors/Exception";
import { IEventMessage } from "@/shared/interfaces/IEventMessage";
import { randomUUID as uuid } from "node:crypto";

export class EventMessageIPC implements IEventMessage {
    public isEvent(): boolean {
        return !!process?.send;
    }

    public async sendEventAndReturn<T>(
        payload: IEventPayload | null | undefined = undefined,
        type?: string
    ) {
        if (!this.isEvent() || !process?.connected) {
            throw new Exception("IPC channel not available");
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
                            if (error) {
                                const err = new ErrorTransport().rebuild(error);
                                return reject(err);
                            }
                            return resolve(data as T);
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
