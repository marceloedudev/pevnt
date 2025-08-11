import BadRequestException from "@/domain/error/BadRequestException";
import ConsumerAbstraction from "@/infra/eventbus/abstraction/ConsumerAbstraction";
import EventCommand from "@/domain/eventbus/EventCommand";
import IStepAbstraction from "@/domain/eventbus/IStepAbstraction";
import ITransportType from "@/domain/eventbus/ITransportType";
import UserConsumerBegin from "./steps/UserConsumerBegin";
import UserConsumerCommand from "@/domain/event/user/UserConsumerCommand";
import UserConsumerCompleted from "./steps/UserConsumerCompleted";
import UserConsumerFailed from "./steps/UserConsumerFailed";

export default class UserConsumer extends ConsumerAbstraction {
    private consumers: { userId; consumerId }[];

    constructor() {
        super();
        this.consumers = [];
    }

    public transport(): ITransportType {
        return ITransportType.WORKER;
    }

    public getCommand(params?: any): EventCommand {
        return new UserConsumerCommand({
            ...params,
        });
    }

    public getConsumers(): Array<IStepAbstraction> {
        return [
            new UserConsumerBegin(),
            new UserConsumerCompleted(),
            new UserConsumerFailed(),
        ];
    }

    public async create({ params }) {
        const { userId } = params;
        const getConsumerById = this.consumers.find(
            ({ userId: id }) => id === userId
        );
        if (getConsumerById) {
            throw new BadRequestException("This user id already exists.");
        }
        const { id } = await super.create({ params: { userId } });
        this.consumers.push({ userId, consumerId: id });
        return { id };
    }
}
