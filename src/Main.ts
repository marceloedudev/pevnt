import Delay from "./domain/timers/Delay";
import UserConsumer from "./infra/event/consumer/UserConsumer/UserConsumer";

const userConsumer = new UserConsumer();

const addConsumer = async (userId: number) => {
    return userConsumer.create({
        params: {
            userId,
        },
    });
};

(async () => {
    try {
        await addConsumer(103);
        await addConsumer(104);
        await addConsumer(105);
        await addConsumer(106);
        // await addConsumer(104);
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
            for await (const id of userConsumer.listWorkers()) {
                await userConsumer.stop(id);
            }
            await Delay(1000);
        } finally {
            process.exit(0);
        }
    });
});
