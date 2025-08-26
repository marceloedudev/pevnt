import { Exception } from "@/shared/errors/Exception";
import { IEventMessage } from "@/shared/interfaces/IEventMessage";
import { IEventPayload } from "@/shared/interfaces/IEventResponseType";
import { InMemoryDatabase } from "@/infra/database/InMemoryDatabase";

export class EventMessageMemory implements IEventMessage {
    public isEvent(): boolean {
        return false;
    }

    public async sendEventAndReturn(
        payload: IEventPayload | null | undefined = undefined,
        type?: string
    ): Promise<any> {
        const consumers = InMemoryDatabase.getInstance().getConsumers();

        if (!consumers.length) {
            throw new Exception("Empty consumers");
        }
        if (Array.isArray(consumers)) {
            for (const consumer of consumers) {
                if (type && consumer.getStatus() === type) {
                    try {
                        const response = await consumer.onMessage({
                            data: payload.data,
                        });
                        if (response instanceof Function) {
                            throw new Exception("Bad response on event");
                        }
                        return response;
                    } catch (error) {
                        throw error;
                    }
                }
            }
        } else {
            try {
                const response = await consumers({
                    data: payload.data,
                });
                if (response instanceof Function) {
                    throw new Exception("Bad response on event");
                }
                return response;
            } catch (error) {
                throw error;
            }
        }
    }
}
