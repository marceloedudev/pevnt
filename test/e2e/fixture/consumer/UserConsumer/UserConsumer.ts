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
            .command<any>(({ params }) => ({
                filename: "./test/e2e/fixture/commands/user-command.ts",
                argv: ["--userid", `${params.userId}`],
            }))
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
