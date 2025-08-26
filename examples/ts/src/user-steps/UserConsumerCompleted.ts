import { IStepMessage, IStepMessagePayload } from "../../../../dist";

import { IUserCompletedPayload } from "@/interfaces";

export class UserConsumerCompleted implements IStepMessage {
    public getStatus(): string {
        return "completed";
    }

    public async onMessage({
        data,
    }: IStepMessagePayload<IUserCompletedPayload>) {
        console.log("UserConsumerCompleted ", { data });
    }
}
