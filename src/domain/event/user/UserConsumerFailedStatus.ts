import EventStatus from "@/domain/eventbus/EventStatus";

export default class UserConsumerFailedStatus extends EventStatus {
    constructor() {
        super({
            name: "failed",
        });
    }
}
