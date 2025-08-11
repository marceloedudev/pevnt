import EventStatus from "@/domain/eventbus/EventStatus";

export default class UserConsumerBeginStatus extends EventStatus {
    constructor() {
        super({
            name: "begin",
        });
    }
}
