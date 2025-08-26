import { IStepMessage, IStepMessagePayload } from "../../../../dist";

import { IUserFailedPayload } from "@/interfaces";

export class UserConsumerFailed implements IStepMessage {
    public getStatus(): string {
        return "failed";
    }

    public async onMessage({ data }: IStepMessagePayload<IUserFailedPayload>) {
        console.log("UserConsumerFailed ", { data });
    }
}
