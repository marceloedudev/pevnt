import {
    IItemParams,
    IUserBeginPayload,
    IUserCompletedPayload,
    IUserFailedPayload,
    IUserParams,
} from "./interfaces";
import {
    IStepMessage,
    IStepMessagePayload,
    ITransportType,
    MessageConsumerBase,
} from "pevnt";

import { Delay } from "./Delay";

(async () => {
    const itemConsumer = new MessageConsumerBase()
        .transport(ITransportType.WORKER)
        .command<IItemParams>(({ params }: any) => ({
            filename: "./src/item-command.ts",
            argv: ["--itemid", `${params.itemId}`],
        }))
        .consumers(async ({ data }) => {
            console.log(".consumers() ", { data });
            return { itemId: data.item_id };
        });

    await itemConsumer.create<IItemParams>({
        params: { itemId: 10 },
    });

    for (const id of itemConsumer.listConsumers()) {
        await itemConsumer.stop(id);
    }

    await Delay(2000);

    await itemConsumer.create<IItemParams>({
        params: { itemId: 20 },
    });

    const userConsumer = new MessageConsumerBase()
        .transport(ITransportType.PROCESS)
        .command<IUserParams>(({ params }) => ({
            filename: "./src/user-command.ts",
            argv: ["--userid", `${params.userId}`],
        }))
        .consumers([
            {
                getStatus: (): string => "begin",
                onMessage: async ({
                    data,
                }: IStepMessagePayload<IUserBeginPayload>) => {
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
                getStatus: (): string => "completed",
                onMessage: async ({
                    data,
                }: IStepMessagePayload<IUserCompletedPayload>) => {
                    console.log("UserConsumerCompleted ", { data });
                },
            },
            {
                getStatus: (): string => "failed",
                onMessage: async ({
                    data,
                }: IStepMessagePayload<IUserFailedPayload>) => {
                    console.log("UserConsumerFailed ", { data });
                },
            },
        ] as IStepMessage[]);

    await userConsumer.create<IUserParams>({
        params: { userId: 88 },
    });

    for (const id of userConsumer.listConsumers()) {
        await userConsumer.stop(id);
    }

    await Delay(2000);

    await userConsumer.create<IUserParams>({
        params: { userId: 89 },
    });

    await userConsumer.create<IUserParams>({
        params: { userId: 90 },
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
})();
