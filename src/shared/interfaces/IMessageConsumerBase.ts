import { IStepMessage, IStepMessagePayload } from "./IStepMessage";

export interface IMessageConsumerRegister {
    filename: string;
    filetype: string;
    params: any;
    argv: string[];
    consumers:
        | Array<IStepMessage>
        | ((arg: IStepMessagePayload<any>) => Promise<any>);
}

export interface IMessageConsumerBase {
    register({
        filename,
        filetype,
        params,
        argv,
        consumers,
    }: IMessageConsumerRegister): Promise<IMessageConsumerBase>;
    events({ onExit }): Promise<IMessageConsumerBase>;
    stop(): Promise<void>;
}
