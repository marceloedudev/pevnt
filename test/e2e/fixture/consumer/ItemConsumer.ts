import { ITransportType } from "@/index";
import { MessageConsumerBase } from "@/infra/eventbus/MessageConsumerBase";

export class ItemConsumer {
    private consumer: MessageConsumerBase;

    constructor() {
        this.consumer = new MessageConsumerBase()
            .transport(ITransportType.PROCESS)
            .filename("./test/e2e/fixture/commands/item-command.ts")
            .consumers(async ({ data }: { data: any }) => {
                console.log("ItemConsumer.ts >> ", { data });
                return { itemId: data.item_id };
            })
            .onExit(({ id, code }) => {
                console.log("Consumer on exit:", { id, code });
            })
            .onStop(({ id }) => {
                console.log("Consumer on stop:", { id });
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
