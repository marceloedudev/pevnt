import { IEventPayload } from "./IEventResponseType";

export default interface IEventMessage {
    isEvent(): boolean;
    sendEventAndReturn<T>(payload?: IEventPayload, type?: string): Promise<any>;
}
