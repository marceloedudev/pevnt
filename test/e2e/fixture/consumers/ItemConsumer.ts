import { MessageConsumerBase } from "@/infra/eventbus/MessageConsumerBase";
import { TransportType } from "@/shared/enums/TransportType";

export class ItemConsumer {
    private consumer: MessageConsumerBase;

    constructor(options?: { transport?: TransportType }) {
        const { transport = TransportType.PROCESS } = options || {};
        this.consumer = new MessageConsumerBase()
            .transport(transport)
            .filename("./test/e2e/fixture/commands/item-command.ts")
            .consumers(async ({ data }: { data: any }) => {
                console.log("ItemConsumer:", { data });
                return { itemId: data.item_id };
            })
            .onExit(({ id, code }) => {
                console.log("Item consumer on exit:", { id, code });
            })
            .onStop(({ id }) => {
                console.log("Item consumer on stop:", { id });
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
