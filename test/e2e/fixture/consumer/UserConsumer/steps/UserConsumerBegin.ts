import { IStepMessage, IStepMessagePayload } from "@/index";

import { BadRequestException } from "../../../error/BadRequestException";
import { Delay } from "@/shared/utils/Delay";
import { NotFoundException } from "../../../error/NotFoundException";

interface IUserInput {
    user_id: number;
}

export class UserConsumerBegin implements IStepMessage {
    public getStatus(): string {
        return "begin";
    }

    public async onMessage({ data }: IStepMessagePayload<IUserInput>) {
        console.log("UserConsumerBegin ", { data });
        const { user_id } = data;
        if (!user_id) {
            throw new NotFoundException("Invalid user id");
        }
        await Delay(2000);
        if (user_id > 10 && user_id < 20) {
            await Delay(3000);
            throw new BadRequestException("Bad user id");
        }
        const url = `string;;${user_id}`;
        await Delay(1000);
        return {
            url,
        };
    }
}
