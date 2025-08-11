import BadRequestException from "@/domain/error/BadRequestException";
import Delay from "@/domain/timers/Delay";
import EventStatus from "@/domain/eventbus/EventStatus";
import NotFoundException from "@/domain/error/NotFoundException";
import StepAbstraction from "@/infra/eventbus/abstraction/StepAbstraction";
import UserConsumerBeginStatus from "@/domain/event/user/UserConsumerBeginStatus";

export default class UserConsumerBegin extends StepAbstraction {
    constructor() {
        super();
    }

    public getStatus(): EventStatus {
        return new UserConsumerBeginStatus();
    }

    public async onMessage({ data }) {
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
