import { BadRequestException } from "../../error/BadRequestException";
import { ITransportType } from "@/index";
import { MessageConsumerBase } from "@/infra/eventbus/MessageConsumerBase";
import { UserConsumerBegin } from "./steps/UserConsumerBegin";
import { UserConsumerCompleted } from "./steps/UserConsumerCompleted";
import { UserConsumerFailed } from "./steps/UserConsumerFailed";

export class UserConsumer {
    private consumers: { userId; consumerId }[];

    private consumer: MessageConsumerBase;

    constructor() {
        this.consumers = [];
        this.consumer = new MessageConsumerBase()
            .transport(ITransportType.WORKER)
            .filename("./test/e2e/fixture/commands/user-command.ts")
            .consumers([
                new UserConsumerBegin(),
                new UserConsumerCompleted(),
                new UserConsumerFailed(),
            ])
            .onExit(({ id, code }) => {
                console.log("Consumer on exit:", { id, code });
            })
            .onStop(({ id }) => {
                console.log("Consumer on stop:", { id });
            });
    }

    public async create({ params }) {
        const { userId } = params;
        const getConsumerById = this.consumers.find(
            ({ userId: id }) => id === userId
        );
        if (getConsumerById) {
            throw new BadRequestException("This user id already exists.");
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
