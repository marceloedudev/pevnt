import ConsumerAbstraction from "@/infra/eventbus/abstraction/ConsumerAbstraction";
import EventCommand from "@/domain/eventbus/EventCommand";
import IStepAbstraction from "@/domain/eventbus/IStepAbstraction";
import ITransportType from "@/domain/eventbus/ITransportType";
import ItemConsumerCommand from "@/domain/event/item/ItemConsumerCommand";

export default class ItemConsumer extends ConsumerAbstraction {
    constructor() {
        super();
    }

    public transport(): ITransportType {
        return ITransportType.PROCESS;
    }

    public getCommand(params?: any): EventCommand {
        return new ItemConsumerCommand({
            ...params,
        });
    }

    public getConsumers():
        | Array<IStepAbstraction>
        | ((arg: { data: any }) => Promise<any>) {
        return async ({ data }: { data: any }) => {
            console.log("ItemConsumer.ts >> ", { data });
            return { itemId: data.item_id };
        };
    }

    public async create({ params }) {
        const { itemId } = params;
        const { id } = await super.create({ params: { itemId } });
        return { id };
    }
}
