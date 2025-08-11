import CallConsumerCommand from "@/domain/event/call/CallConsumerCommand";
import ConsumerAbstraction from "@/infra/eventbus/abstraction/ConsumerAbstraction";
import EventCommand from "@/domain/eventbus/EventCommand";
import IStepAbstraction from "@/domain/eventbus/IStepAbstraction";
import ITransportType from "@/domain/eventbus/ITransportType";

export default class CallConsumer extends ConsumerAbstraction {
    constructor() {
        super();
    }

    public transport(): ITransportType {
        return ITransportType.PROCESS;
    }

    public getCommand(): EventCommand {
        return new CallConsumerCommand();
    }

    public getConsumers():
        | Array<IStepAbstraction>
        | ((arg: { data: any }) => Promise<any>) {
        return async ({ data }: { data: any }) => {
            console.log("CallConsumer.ts >> ", { data });
            return true;
        };
    }

    public async create() {
        const { id } = await super.create({ params: undefined });
        return { id };
    }
}
