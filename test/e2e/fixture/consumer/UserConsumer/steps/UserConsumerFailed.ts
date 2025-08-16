import { IStepMessage, IStepMessagePayload } from "@/index";

export class UserConsumerFailed implements IStepMessage {
    public getStatus(): string {
        return "failed";
    }

    public async onMessage({ data }: IStepMessagePayload<any>) {
        console.log("UserConsumerFailed ", { data });
    }
}
