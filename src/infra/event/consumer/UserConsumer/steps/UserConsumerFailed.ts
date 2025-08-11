import EventStatus from "@/domain/eventbus/EventStatus";
import StepAbstraction from "@/infra/eventbus/abstraction/StepAbstraction";
import UserConsumerFailedStatus from "@/domain/event/user/UserConsumerFailedStatus";

export default class UserConsumerFailed extends StepAbstraction {
    constructor() {
        super();
    }

    public getStatus(): EventStatus {
        return new UserConsumerFailedStatus();
    }

    public async onMessage({ data }) {
        console.log("UserConsumerFailed ", { data });
    }
}
