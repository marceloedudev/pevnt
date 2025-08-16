import { IStepMessage, IStepMessagePayload } from "@/index";

export class UserConsumerCompleted implements IStepMessage {
    public getStatus(): string {
        return "completed";
    }

    public async onMessage({ data }: IStepMessagePayload<any>) {
        console.log("UserConsumerCompleted ", { data });
    }
}
