import { ICommandInput } from "./ICommandInput";

export interface IMessageConsumerBase {
    register({
        command,
        consumers,
    }: {
        command: ICommandInput;
        consumers: any;
    }): Promise<IMessageConsumerBase>;
    events({ onExit }): Promise<IMessageConsumerBase>;
    stop(): Promise<void>;
}
