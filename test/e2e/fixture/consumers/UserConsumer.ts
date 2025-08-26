import { Delay } from "@/shared/utils/Delay";
import { Exception } from "@/shared/errors/Exception";
import { MessageConsumerBase } from "@/infra/eventbus/MessageConsumerBase";
import { TransportType } from "@/shared/enums/TransportType";

export class UserConsumer {
    private consumers: { userId; consumerId }[];

    private consumer: MessageConsumerBase;

    constructor(options?: { transport?: TransportType }) {
        const { transport = TransportType.WORKER } = options || {};
        this.consumers = [];
        this.consumer = new MessageConsumerBase()
            .transport(transport)
            .filename("./test/e2e/fixture/commands/user-command.ts")
            .consumers([
                {
                    getStatus: (): string => "begin",
                    onMessage: async ({ data }) => {
                        console.log("UserConsumerBegin ", { data });
                        const { user_id } = data;
                        if (!user_id) {
                            throw new Exception("Invalid user id");
                        }
                        await Delay(2000);
                        if (user_id > 10 && user_id < 20) {
                            await Delay(3000);
                            throw new Exception("Bad user id");
                        }
                        const url = `string;;${user_id}`;
                        await Delay(1000);
                        return {
                            url,
                        };
                    },
                },
                {
                    getStatus: (): string => "completed",
                    onMessage: async ({ data }) => {
                        console.log("UserConsumerCompleted ", { data });
                    },
                },
                {
                    getStatus: (): string => "failed",
                    onMessage: async ({ data }) => {
                        console.log("UserConsumerFailed ", { data });
                    },
                },
            ])
            .onExit(({ id, code }) => {
                console.log("User consumer on exit:", { id, code });
            })
            .onStop(({ id }) => {
                console.log("User consumer on stop:", { id });
            });
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
