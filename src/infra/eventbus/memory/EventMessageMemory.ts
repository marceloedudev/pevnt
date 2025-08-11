import IEventMessage from "@/domain/eventbus/IEventMessage";
import { IEventPayload } from "@/domain/eventbus/IEventResponseType";

export default class EventMessageMemory implements IEventMessage {
    public isEvent(): boolean {
        return false;
    }

    public async sendEventAndReturn(
        payload: IEventPayload | null | undefined = undefined,
        type?: string
    ): Promise<any> {
        const consumers = globalThis?.fakeDatabase?.getConsumers() || [];
        if (!consumers.length) {
            throw new Error("Empty consumers");
        }
        if (Array.isArray(consumers)) {
            for (const consumer of consumers) {
                if (type && consumer.getStatus().getName() === type) {
                    try {
                        const response = consumer.onMessage({ ...payload });
                        if (response instanceof Function) {
                            throw new Error("Bad response on event");
                        }
                        return response || true;
                    } catch (error: any) {
                        throw error;
                    }
                }
            }
        } else {
            try {
                const response = await consumers({ ...payload });
                if (response instanceof Function) {
                    throw new Error("Bad response on event");
                }
                return response || true;
            } catch (error: any) {
                throw error;
            }
        }
    }
}
