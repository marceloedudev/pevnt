import { Delay } from "@/shared/utils/Delay";
import { ItemConsumer } from "../consumer/ItemConsumer";

const itemConsumer = new ItemConsumer();

const addConsumer = async (itemId: number) => {
    return itemConsumer.create({
        params: {
            itemId,
        },
    });
};

(async () => {
    try {
        await addConsumer(333);
        console.log({
            first: itemConsumer.getConsumer().listConsumers(),
        });
        for (const id of itemConsumer.getConsumer().listConsumers()) {
            await itemConsumer.getConsumer().stop(id);
        }
        console.log({
            itemList: itemConsumer.getConsumer().listConsumers(),
        });
        await addConsumer(666);
        console.log({
            itemListFinal: itemConsumer.getConsumer().listConsumers(),
        });
    } catch (error) {
        console.error({ error });
    }
})();

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
            for (const id of itemConsumer.getConsumer().listConsumers()) {
                await itemConsumer.getConsumer().stop(id);
            }
            await Delay(1000);
        } finally {
            process.exit(0);
        }
    });
});
