import { IStepMessage, IStepMessagePayload } from "../../../../dist";

import { Delay } from "@/Delay";
import { IUserBeginPayload } from "@/interfaces";

export class UserConsumerBegin implements IStepMessage {
    public getStatus(): string {
        return "begin";
    }

    public async onMessage({ data }: IStepMessagePayload<IUserBeginPayload>) {
        console.log("UserConsumerBegin ", { data });
        const { user_id } = data;
        const url = `string;;${user_id}`;
        await Delay(1000);
        return {
            url,
        };
    }
}
