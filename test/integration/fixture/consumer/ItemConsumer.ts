import { MessageConsumerBase } from "@/infra/eventbus/MessageConsumerBase";
import { TransportType } from "@/shared/enums/TransportType";

export class ItemConsumer {
    private consumer: MessageConsumerBase;

    constructor() {
        this.consumer = new MessageConsumerBase()
            .transport(TransportType.MEMORY)
            .filename("./test/integration/fixture/commands/item-command.ts")
            .consumers(async ({ data }: { data: any }) => {
                return { itemId: data.item_id };
            });
    }

    public async create({ params }) {
        const { itemId } = params;
        const { id } = await this.consumer.create({
            params: { itemId },
        });
        return { id };
    }

    public getConsumer() {
        return this.consumer;
    }
}
