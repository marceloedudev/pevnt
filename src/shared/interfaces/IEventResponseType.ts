export type IEventPayload<D = any> = { data?: D };
export type IEventResponseType = {
    id: string;
    type?: string;
    data?: any;
    error?: any;
};
export type ITransportMessage = { data?: any; error?: any };
