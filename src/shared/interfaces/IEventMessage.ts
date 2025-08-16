import { IEventPayload } from "./IEventResponseType";

export interface IEventMessage {
    isEvent(): boolean;
    sendEventAndReturn(payload?: IEventPayload, type?: string): Promise<any>;
}
