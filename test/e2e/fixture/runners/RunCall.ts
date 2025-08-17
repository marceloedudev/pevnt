import { CallConsumer } from "../consumer/CallConsumer";
import { Delay } from "@/shared/utils/Delay";

const callConsumer = new CallConsumer();

const addConsumer = async () => {
    return callConsumer.create();
};

(async () => {
    try {
        await addConsumer();
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
            for (const id of callConsumer.getConsumer().listConsumers()) {
                await callConsumer.getConsumer().stop(id);
            }
            await Delay(1000);
        } finally {
            process.exit(0);
        }
    });
});
