import {
    IStepMessage,
    IStepMessagePayload,
} from "@/shared/interfaces/IStepMessage";

export class UserConsumerCompleted implements IStepMessage {
    public getStatus(): string {
        return "completed";
    }

    public async onMessage({ data }: IStepMessagePayload<any>) {}
}
