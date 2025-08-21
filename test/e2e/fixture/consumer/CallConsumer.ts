import { ITransportType } from "@/index";
import { MessageConsumerBase } from "@/infra/eventbus/MessageConsumerBase";

export class CallConsumer {
    private consumer: MessageConsumerBase;

    constructor() {
        this.consumer = new MessageConsumerBase()
            .transport(ITransportType.PROCESS)
            .filename("./test/e2e/fixture/commands/call-command.ts")
            .consumers(async ({ data }: { data: any }) => {
                console.log("CallConsumer.ts >> ", { data });
                return -1;
            })
            .onExit(({ id, code }) => {
                console.log("Consumer on exit:", { id, code });
            })
            .onStop(({ id }) => {
                console.log("Consumer on stop:", { id });
            });
    }

    public async create() {
        const { id } = await this.consumer.create({
            params: undefined,
        });
        return { id };
    }

    public getConsumer() {
        return this.consumer;
    }
}
