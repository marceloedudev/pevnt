import {
    IStepMessage,
    IStepMessagePayload,
    MessageConsumerBase,
    TransportType,
} from "../../../dist";
import {
    IUserBeginPayload,
    IUserCompletedPayload,
    IUserFailedPayload,
    IUserParams,
} from "./interfaces";

import { Delay } from "./Delay";
import { UserConsumerBegin } from "./user-steps/UserConsumerBegin";
import { UserConsumerCompleted } from "./user-steps/UserConsumerCompleted";
import { UserConsumerFailed } from "./user-steps/UserConsumerFailed";

export class UserConsumer {
    private consumer: MessageConsumerBase;

    constructor() {
        this.consumer = new MessageConsumerBase()
            .transport(TransportType.PROCESS)
            .filename("./src/user-command.ts")
            .consumers([
                // {
                //     getStatus: (): string => "begin",
                //     onMessage: async ({
                //         data,
                //     }: IStepMessagePayload<IUserBeginPayload>) => {
                //         console.log("UserConsumerBegin ", { data });
                //         const { user_id } = data;
                //         const url = `string;;${user_id}`;
                //         await Delay(1000);
                //         return {
                //             url,
                //         };
                //     },
                // },
                // {
                //     getStatus: (): string => "completed",
                //     onMessage: async ({
                //         data,
                //     }: IStepMessagePayload<IUserCompletedPayload>) => {
                //         console.log("UserConsumerCompleted ", { data });
                //     },
                // },
                // {
                //     getStatus: (): string => "failed",
                //     onMessage: async ({
                //         data,
                //     }: IStepMessagePayload<IUserFailedPayload>) => {
                //         console.log("UserConsumerFailed ", { data });
                //     },
                // },
                new UserConsumerBegin(),
                new UserConsumerCompleted(),
                new UserConsumerFailed(),
            ] as IStepMessage[])
            .onExit(({ id, code }) => {
                console.log("Consumer on exit:", { id, code });
            })
            .onStop(({ id }) => {
                console.log("Consumer on stop:", { id });
            });
    }

    public async create({ params }) {
        const { userId } = params;
        const { id } = await this.consumer.create<IUserParams>({
            params: { userId },
        });
        return { id };
    }

    public async removeAll() {
        for (const id of this.consumer.listConsumers()) {
            await this.consumer.stop(id);
        }
    }

    public list() {
        return this.consumer.listConsumers();
    }

    public getConsumer() {
        return this.consumer;
    }
}
