import ArgumentsParse from "@/domain/text/parse/ArgumentsParse";
import CommandParser from "@/domain/text/parse/CommandParser";
import IConsumerAbstraction from "@/domain/eventbus/IConsumerAbstraction";
import { IEventPayload } from "@/domain/eventbus/IEventResponseType";
import StepAbstraction from "../abstraction/StepAbstraction";
import { Worker } from "worker_threads";
import { isFunction } from "@/domain/helpers/methods";
import path from "path";

export default class MessageConsumerHandlerWorker
    implements IConsumerAbstraction
{
    private worker!: Worker;

    private consumers!:
        | Array<StepAbstraction>
        | ((arg: { data: any }) => Promise<any>);

    public async register({
        command,
        consumers,
    }): Promise<IConsumerAbstraction> {
        this.consumers = consumers;

        const parsedCommand = new CommandParser(
            command.getCommandArgs().join(" ")
        ).parse();

        const parsedArguments =
            parsedCommand.argv?.length > 0
                ? new ArgumentsParse(parsedCommand.argv).parse()
                : {};

        const worker = new Worker(
            path.resolve(path.join(parsedCommand.filename)),
            {
                workerData: {
                    ...parsedArguments,
                },
                execArgv: [
                    "-r",
                    "ts-node/register",
                    "-r",
                    "tsconfig-paths/register",
                ],
                argv: [...parsedCommand.argv],
            }
        );

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
                const eventId = rest?.id;
                if (Array.isArray(consumers) && consumers?.length > 0) {
                    for await (const consumer of consumers) {
                        const eventName = consumer.getStatus().getName();
                        if (type === eventName) {
                            try {
                                const response = await consumer.onMessage({
                                    type,
                                    ...rest,
                                });
                                if (response instanceof Function) {
                                    await this.sendError(
                                        {
                                            message: "Bad response on event",
                                        },
                                        { type: eventName, id: eventId }
                                    );
                                    return;
                                }
                                await this.sendData(response || true, {
                                    type: eventName,
                                    id: eventId,
                                });
                            } catch (error: any) {
                                await this.sendError(
                                    { message: error.message },
                                    { type: eventName, id: eventId }
                                );
                            }
                        }
                    }
                } else if (isFunction(consumers)) {
                    try {
                        const response: any = await consumers({
                            type,
                            ...rest,
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
                        await this.sendData(response || true, {
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
                console.log({ error });
            }
        });

        return this;
    }

    public async stop(): Promise<void> {
        await this.worker?.terminate?.();
    }

    private async send(payload?: IEventPayload, options?) {
        this.worker?.postMessage?.({
            data: payload?.data,
            error: payload?.error,
            ...options,
        });
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
