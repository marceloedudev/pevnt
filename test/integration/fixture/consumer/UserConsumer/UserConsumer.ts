import { Exception } from "@/shared/errors/Exception";
import { MessageConsumerBase } from "@/infra/eventbus/MessageConsumerBase";
import { TransportType } from "@/shared/enums/TransportType";
import { UserConsumerBegin } from "./steps/UserConsumerBegin";
import { UserConsumerCompleted } from "./steps/UserConsumerCompleted";
import { UserConsumerFailed } from "./steps/UserConsumerFailed";

export class UserConsumer {
    private consumers: { userId; consumerId }[];

    private consumer: MessageConsumerBase;

    constructor(options?: { transport?: TransportType }) {
        const { transport = TransportType.WORKER } = options || {};
        this.consumers = [];
        this.consumer = new MessageConsumerBase()
            .transport(transport)
            .filename("./test/integration/fixture/commands/user-command.ts")
            .consumers([
                new UserConsumerBegin(),
                new UserConsumerCompleted(),
                new UserConsumerFailed(),
            ]);
    }

    public async create({ params }) {
        const { userId } = params;
        const getConsumerById = this.consumers.find(
            ({ userId: id }) => id === userId
        );
        if (getConsumerById) {
            throw new Exception("This user id already exists.");
        }
        const { id } = await this.consumer.create({
            params: { userId },
        });
        this.consumers.push({ userId, consumerId: id });
        return { id };
    }

    public getConsumer() {
        return this.consumer;
    }
}
