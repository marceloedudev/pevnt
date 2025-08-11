import Delay from "./domain/timers/Delay";
import ItemConsumer from "./infra/event/consumer/ItemConsumer";

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
    } catch (error) {
        console.log({ error });
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
            for await (const id of itemConsumer.listWorkers()) {
                await itemConsumer.stop(id);
            }
            await Delay(1000);
        } finally {
            process.exit(0);
        }
    });
});
