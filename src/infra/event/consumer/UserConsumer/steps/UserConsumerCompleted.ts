import EventStatus from "@/domain/eventbus/EventStatus";
import StepAbstraction from "@/infra/eventbus/abstraction/StepAbstraction";
import UserConsumerCompletedStatus from "@/domain/event/user/UserConsumerCompletedStatus";

export default class UserConsumerCompleted extends StepAbstraction {
    constructor() {
        super();
    }

    public getStatus(): EventStatus {
        return new UserConsumerCompletedStatus();
    }

    public async onMessage({ data }) {
        console.log("UserConsumerCompleted ", { data });
    }
}
