import { Delay } from "@/shared/utils/Delay";
import { ItemConsumer } from "../consumers/ItemConsumer";
import { ParserFactory } from "@/infra/acmdp/ParserFactory";
import { TransportType } from "@/shared/enums/TransportType";

const parserFactory = new ParserFactory();
const commandParsed = parserFactory
    .createCommandParser()
    .parse(`${process.argv.join(" ")}`);

const parsed = new ParserFactory()
    .createArgumentsParser()
    .parse(commandParsed.argv);

const { itemId = [], transport = "PROCESS" }: any = parsed || {};

const itemConsumer = new ItemConsumer({
    transport:
        transport.toUpperCase() === "PROCESS"
            ? TransportType.PROCESS
            : TransportType.WORKER,
});

const addConsumer = async (itemId: number) => {
    return itemConsumer.create({
        params: {
            itemId,
        },
    });
};

(async () => {
    try {
        console.log({ itemId });

        for (const id of itemId) {
            const { id: cid } = await addConsumer(id);
            await itemConsumer.getConsumer().stop(cid);
        }

        console.log({
            empty: itemConsumer.getConsumer().listConsumers(),
        });

        for (const id of itemId) {
            await addConsumer(id);
        }

        console.log({
            total: itemConsumer.getConsumer().listConsumers(),
        });
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
            for (const id of itemConsumer.getConsumer().listConsumers()) {
                await itemConsumer.getConsumer().stop(id);
            }
            await Delay(1000);
        } finally {
            process.exit(0);
        }
    });
});
