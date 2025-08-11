import EventStatus from "@/domain/eventbus/EventStatus";

export default class UserConsumerCompletedStatus extends EventStatus {
    constructor() {
        super({
            name: "completed",
        });
    }
}
