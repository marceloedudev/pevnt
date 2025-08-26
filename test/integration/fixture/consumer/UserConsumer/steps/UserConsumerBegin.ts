import {
    IStepMessage,
    IStepMessagePayload,
} from "@/shared/interfaces/IStepMessage";

import { Delay } from "@/shared/utils/Delay";
import { Exception } from "@/shared/errors/Exception";

interface IUserInput {
    user_id: number;
}

export class UserConsumerBegin implements IStepMessage {
    public getStatus(): string {
        return "begin";
    }

    public async onMessage({ data }: IStepMessagePayload<IUserInput>) {
        const { user_id } = data;
        if (!user_id) {
            throw new Exception("Invalid user id");
        }
        await Delay(2000);
        if (user_id > 10 && user_id < 20) {
            await Delay(3000);
            throw new Exception("Bad user id");
        }
        const url = `string;;${user_id}`;
        await Delay(1000);
        return {
            url,
        };
    }
}
