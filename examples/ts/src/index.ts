// import {
//     IStepMessage,
//     IStepMessagePayload,
//     TransportType,
//     MessageConsumerBase,
// } from "pevnt";
import { MessageConsumerBase, TransportType } from "../../../dist";

import { Delay } from "./Delay";
import { IItemParams } from "./interfaces";
import { UserConsumer } from "./UserConsumer";

(async () => {
    const itemConsumer = new MessageConsumerBase()
        .transport(TransportType.WORKER)
        .filename("./src/item-command.ts")
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

    const { id } = await itemConsumer.create<IItemParams>({
        params: { itemId: 10 },
    });

    console.log({ exists: itemConsumer.exists(id) });

    for (const id of itemConsumer.listConsumers()) {
        await itemConsumer.stop(id);
    }

    await Delay(2000);

    await itemConsumer.create<IItemParams>({
        params: { itemId: 20 },
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

    console.log({
        item: itemConsumer.listConsumers(),
        user: userConsumer.list(),
    });

    await Delay(10000);

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
})();
