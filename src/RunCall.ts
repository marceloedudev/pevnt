import CallConsumer from "./infra/event/consumer/CallConsumer";
import Delay from "./domain/timers/Delay";

const callConsumer = new CallConsumer();

const addConsumer = async () => {
    return callConsumer.create();
};

(async () => {
    try {
        await addConsumer();
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
            for await (const id of callConsumer.listWorkers()) {
                await callConsumer.stop(id);
            }
            await Delay(1000);
        } finally {
            process.exit(0);
        }
    });
});
