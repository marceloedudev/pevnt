import { ITransportType, MessageConsumerBase } from "../../dist/index.mjs";

import { Delay } from "./Delay.mjs";

const itemConsumer = new MessageConsumerBase()
    .transport(ITransportType.PROCESS)
    .command(({ params }) => ({
        filename: "./item-command.mjs",
        argv: ["--itemid", `${params.itemId}`],
    }))
    .consumers(async ({ data }) => {
        console.log(".consumers() ", { data });
        return { itemId: data.item_id };
    });

await itemConsumer.create({
    params: { itemId: 10 },
});

const userConsumer = new MessageConsumerBase()
    .transport(ITransportType.WORKER)
    .command(({ params }) => ({
        filename: "./user-command.js",
        argv: ["--userid", `${params.userId}`],
    }))
    .consumers([
        {
            getStatus: () => "begin",
            onMessage: async ({ data }) => {
                console.log("UserConsumerBegin ", { data });
                const { user_id } = data;
                const url = `string;;${user_id}`;
                await Delay(1000);
                return {
                    url,
                };
            },
        },
        {
            getStatus: () => "completed",
            onMessage: async ({ data }) => {
                console.log("UserConsumerCompleted ", { data });
            },
        },
        {
            getStatus: () => "failed",
            onMessage: async ({ data }) => {
                console.log("UserConsumerFailed ", { data });
            },
        },
    ]);

await userConsumer.create({
    params: { userId: 88 },
});

await userConsumer.create({
    params: { userId: 89 },
});

console.log({
    item: itemConsumer.listConsumers(),
    user: userConsumer.listConsumers(),
});

[
    `exit`,
    `SIGINT`,
    `SIGUSR1`,
    `SIGUSR2`,
    `uncaughtException`,
    `SIGTERM`,
].forEach((eventType) => {
    process.once(eventType, async () => {
        try {
            for (const id of itemConsumer.listConsumers()) {
                console.log("remove item ", { id });
                await itemConsumer.stop(id);
            }
            for (const id of userConsumer.listConsumers()) {
                console.log("remove user ", { id });
                await userConsumer.stop(id);
            }
            await Delay(1000);
        } catch (error) {
            console.error({ error });
        } finally {
            process.exit(0);
        }
    });
});
