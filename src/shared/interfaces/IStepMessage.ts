export interface IStepMessage<T = any> {
    getStatus: () => string;
    onMessage: (payload: IStepMessagePayload<T>) => Promise<any>;
}

export interface IStepMessagePayload<I> {
    data: I;
}
