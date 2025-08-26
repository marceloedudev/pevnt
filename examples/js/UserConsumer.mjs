import { MessageConsumerBase, TransportType } from "../../dist/index.js";

import { Delay } from "./Delay.mjs";
import { UserConsumerBegin } from "./user-steps/UserConsumerBegin.mjs";
import { UserConsumerCompleted } from "./user-steps/UserConsumerCompleted.mjs";
import { UserConsumerFailed } from "./user-steps/UserConsumerFailed.mjs";

export class UserConsumer {
    consumer;

    constructor() {
        this.consumer = new MessageConsumerBase()
            .transport(TransportType.PROCESS)
            .filename("./user-command.js")
            .consumers([
                // {
                //     getStatus: () => "begin",
                //     onMessage: async ({ data }) => {
                //         console.log("UserConsumerBegin ", { data });
                //         const { user_id } = data;
                //         const url = `string;;${user_id}`;
                //         await Delay(1000);
                //         return {
                //             url,
                //         };
                //     },
                // },
                // {
                //     getStatus: () => "completed",
                //     onMessage: async ({ data }) => {
                //         console.log("UserConsumerCompleted ", { data });
                //     },
                // },
                // {
                //     getStatus: () => "failed",
                //     onMessage: async ({ data }) => {
                //         console.log("UserConsumerFailed ", { data });
                //     },
                // },
                new UserConsumerBegin(),
                new UserConsumerCompleted(),
                new UserConsumerFailed(),
            ])
            .onExit(({ id, code }) => {
                console.log("User consumer on exit:", { id, code });
            })
            .onStop(({ id }) => {
                console.log("User consumer on stop:", { id });
            });
    }

    async create({ params }) {
        const { userId } = params;
        const { id } = await this.consumer.create({
            params: { userId },
        });
        return { id };
    }

    async removeAll() {
        for (const id of this.consumer.listConsumers()) {
            await this.consumer.stop(id);
        }
    }

    list() {
        return this.consumer.listConsumers();
    }

    getConsumer() {
        return this.consumer;
    }
}
