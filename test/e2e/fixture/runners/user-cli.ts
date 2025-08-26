import { Delay } from "@/shared/utils/Delay";
import { ParserFactory } from "@/infra/acmdp/ParserFactory";
import { TransportType } from "@/shared/enums/TransportType";
import { UserConsumer } from "../consumers/UserConsumer";

const parserFactory = new ParserFactory();
const commandParsed = parserFactory
    .createCommandParser()
    .parse(`${process.argv.join(" ")}`);

const parsed = new ParserFactory()
    .createArgumentsParser()
    .parse(commandParsed.argv);

const { userId = [], transport = "PROCESS" }: any = parsed || {};

const userConsumer = new UserConsumer({
    transport:
        transport.toUpperCase() === "PROCESS"
            ? TransportType.PROCESS
            : TransportType.WORKER,
});

const addConsumer = async (userId: number) => {
    return userConsumer.create({
        params: {
            userId,
        },
    });
};

(async () => {
    try {
        for (const id of userId) {
            await addConsumer(id);
        }
    } catch (error) {
        console.error({
            error,
        });
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
            for (const id of userConsumer.getConsumer().listConsumers()) {
                await userConsumer.getConsumer().stop(id);
            }
            await Delay(1000);
        } finally {
            process.exit(0);
        }
    });
});
