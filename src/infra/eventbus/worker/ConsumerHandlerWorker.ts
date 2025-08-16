import {
    IEventResponseType,
    ITransportMessage,
} from "@/shared/interfaces/IEventResponseType";
import {
    IStepMessage,
    IStepMessagePayload,
} from "@/shared/interfaces/IStepMessage";

import { ArgumentsParse } from "acmdp";
import { DetectFileType } from "@/shared/utils/DetectFileType";
import { Exception } from "@/shared/errors/Exception";
import { ICommandInput } from "@/shared/interfaces/ICommandInput";
import { IMessageConsumerBase } from "@/shared/interfaces/IMessageConsumerBase";
import { Worker } from "worker_threads";
import { isFunction } from "@/shared/utils/Check";
import path from "node:path";

export class ConsumerHandlerWorker implements IMessageConsumerBase {
    private worker!: Worker;

    private consumers!:
        | Array<IStepMessage>
        | ((arg: IStepMessagePayload<any>) => Promise<any>);

    public async register({
        command,
        consumers,
    }: {
        command: ICommandInput;
        consumers:
            | Array<IStepMessage>
            | ((arg: IStepMessagePayload<any>) => Promise<any>);
    }): Promise<IMessageConsumerBase> {
        this.consumers = consumers;

        const { filename, argv = [] } = command;

        const parsedArguments =
            argv?.length > 0 ? new ArgumentsParse(argv).parse() : {};

        let execArgv = [];

        const filetype = DetectFileType(filename);

        if (filetype === "unknown") {
            throw new Exception("Invalid type file");
        }

        if (filetype === "typescript") {
            execArgv = [
                "-r",
                "ts-node/register",
                "-r",
                "tsconfig-paths/register",
            ];
        }

        const worker = new Worker(path.resolve(path.join(filename)), {
            workerData: {
                ...parsedArguments,
            },
            execArgv: [...execArgv],
            argv: [...argv],
        });

        this.worker = worker;

        return this;
    }

    public async events({ onExit }) {
        const worker = this.worker;
        const consumers = this.consumers;

        worker.on("exit", (code) => {
            onExit?.({ code });
        });

        worker.on("message", async (payload) => {
            try {
                const { type, ...rest }: any = payload || {};
                const eventId = `${rest?.id}`;
                if (Array.isArray(consumers) && consumers?.length > 0) {
                    for await (const consumer of consumers) {
                        const eventType = consumer.getStatus();
                        if (type === eventType) {
                            try {
                                const response = await consumer.onMessage({
                                    data: rest.data,
                                });
                                if (response instanceof Function) {
                                    await this.sendError(
                                        {
                                            message: "Bad response on event",
                                        },
                                        { type: eventType, id: eventId }
                                    );
                                    return;
                                }
                                await this.sendData(response, {
                                    type: eventType,
                                    id: eventId,
                                });
                            } catch (error: any) {
                                await this.sendError(
                                    { message: error.message },
                                    { type: eventType, id: eventId }
                                );
                            }
                        }
                    }
                } else if (isFunction(consumers)) {
                    try {
                        const response: any = await consumers({
                            data: rest.data,
                        });
                        if (response instanceof Function) {
                            await this.sendError(
                                {
                                    message: "Bad response on event",
                                },
                                { id: eventId }
                            );
                            return;
                        }
                        await this.sendData(response, {
                            id: eventId,
                        });
                    } catch (error: any) {
                        await this.sendError(
                            { message: error.message },
                            { id: eventId }
                        );
                    }
                }
            } catch (error: any) {
                console.error({ error });
            }
        });

        return this;
    }

    public async stop(): Promise<void> {
        await this.worker?.terminate?.();
    }

    private async send(payload?: ITransportMessage, options?) {
        this.worker?.postMessage?.({
            data: payload?.data,
            error: payload?.error,
            ...options,
        } as IEventResponseType);
    }

    private async sendData(
        data,
        options: { type?: string; id: string }
    ): Promise<void> {
        await this.send(
            {
                data,
            },
            {
                ...options,
            }
        );
    }

    private async sendError(
        error,
        options: { type?: string; id: string }
    ): Promise<void> {
        await this.send(
            {
                error,
            },
            {
                ...options,
            }
        );
    }
}
