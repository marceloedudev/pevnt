// import { TransportType, MessageConsumerBase } from "pevnt";
import { MessageConsumerBase, TransportType } from "../../dist/index.js";

import { Delay } from "./Delay.mjs";
import { UserConsumer } from "./UserConsumer.mjs";

const itemConsumer = new MessageConsumerBase()
    .transport(TransportType.PROCESS)
    .filename("./item-command.mjs")
    .consumers(async ({ data }) => {
        console.log(".consumers() ", { data });
        return { itemId: data.item_id };
    })
    .onExit(({ id, code }) => {
        console.log("Consumer on exit:", { id, code });
    })
    .onStop(({ id }) => {
        console.log("Consumer on stop:", { id });
    });

await itemConsumer.create({
    params: { itemId: 10 },
});

const userConsumer = new UserConsumer();

await userConsumer.create({
    params: { userId: 88 },
});

await userConsumer.removeAll();

await Delay(2000);

await userConsumer.create({
    params: { userId: 89 },
});

await userConsumer.create({
    params: { userId: 90 },
});

await userConsumer.create({
    params: { userId: 12 },
});

console.log({
    item: itemConsumer.listConsumers(),
    user: userConsumer.list(),
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
            await userConsumer.removeAll();
            await Delay(1000);
        } catch (error) {
            console.error({ error });
        } finally {
            process.exit(0);
        }
    });
});
