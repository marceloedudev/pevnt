import {
    IEventResponseType,
    ITransportMessage,
} from "@/shared/interfaces/IEventResponseType";
import {
    IMessageConsumerBase,
    IMessageConsumerRegister,
} from "@/shared/interfaces/IMessageConsumerBase";
import {
    IStepMessage,
    IStepMessagePayload,
} from "@/shared/interfaces/IStepMessage";

import { Worker } from "worker_threads";
import { isFunction } from "@/shared/utils/Check";
import path from "node:path";

export class ConsumerHandlerWorker implements IMessageConsumerBase {
    private worker!: Worker;
    private consumers!:
        | Array<IStepMessage>
        | ((arg: IStepMessagePayload<any>) => Promise<any>);

    public async register({
        filename,
        filetype,
        params,
        argv,
        consumers,
    }: IMessageConsumerRegister): Promise<IMessageConsumerBase> {
        this.consumers = consumers;

        const execArgv =
            filetype === "typescript"
                ? ["-r", "ts-node/register", "-r", "tsconfig-paths/register"]
                : [];

        this.worker = new Worker(path.resolve(path.join(filename)), {
            workerData: { ...params },
            execArgv,
            // argv,
        });

        return this;
    }

    public async events({ onExit }) {
        this.worker.on("exit", (code) => onExit?.({ code: code ?? 0 }));
        this.worker.on("message", async (payload) =>
            this.handleMessage(payload)
        );
        return this;
    }

    private async handleMessage(payload: any) {
        const { type, ...rest } = payload || {};
        const eventId = `${rest?.id}`;
        const consumers = this.consumers;

        const safeRespond = async (response: any, options: any) => {
            if (response instanceof Function) {
                await this.sendError(
                    { message: "Bad response on event" },
                    options
                );
            } else {
                await this.sendData(response, options);
            }
        };

        try {
            if (Array.isArray(consumers)) {
                for await (const consumer of consumers) {
                    if (type === consumer.getStatus()) {
                        const response = await consumer.onMessage({
                            data: rest.data,
                        });
                        await safeRespond(response, { type, id: eventId });
                    }
                }
            } else if (isFunction(consumers)) {
                const response = await consumers({ data: rest.data });
                await safeRespond(response, { id: eventId });
            }
        } catch (error: any) {
            await this.sendError(
                { message: error.message },
                { type, id: eventId }
            );
        }
    }

    public async stop(): Promise<void> {
        await this.worker?.terminate?.();
    }

    private async send(payload?: ITransportMessage, options?): Promise<void> {
        this.worker?.postMessage?.({
            data: payload?.data,
            error: payload?.error,
            ...options,
        } as IEventResponseType);
    }

    private async sendData(data, options: { type?: string; id: string }) {
        await this.send({ data }, options);
    }

    private async sendError(error, options: { type?: string; id: string }) {
        await this.send({ error }, options);
    }
}
