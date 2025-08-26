import {
    IStepMessage,
    IStepMessagePayload,
} from "@/shared/interfaces/IStepMessage";

export class UserConsumerFailed implements IStepMessage {
    public getStatus(): string {
        return "failed";
    }

    public async onMessage({ data }: IStepMessagePayload<any>) {}
}
