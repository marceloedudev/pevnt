import { ChildProcess, spawn } from "node:child_process";
import {
    IEventResponseType,
    ITransportMessage,
} from "@/shared/interfaces/IEventResponseType";
import {
    IStepMessage,
    IStepMessagePayload,
} from "@/shared/interfaces/IStepMessage";

import { DetectFileType } from "@/shared/utils/DetectFileType";
import { Exception } from "@/shared/errors/Exception";
import { ICommandInput } from "@/shared/interfaces/ICommandInput";
import { IMessageConsumerBase } from "@/shared/interfaces/IMessageConsumerBase";
import { ProcessManager } from "../../process/ProcessManager";
import { isFunction } from "@/shared/utils/Check";

export class ConsumerHandlerIPC implements IMessageConsumerBase {
    private subprocess!: ChildProcess;

    private pid!: string;

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

        let subprocess: ChildProcess;

        const filetype = DetectFileType(filename);

        if (filetype === "unknown") {
            throw new Exception("Invalid type file");
        }

        if (filetype === "typescript") {
            subprocess = spawn(
                "ts-node",
                [
                    "--transpile-only",
                    "-r",
                    "ts-node/register",
                    "-r",
                    "tsconfig-paths/register",
                    filename,
                    ...argv,
                ],
                {
                    stdio: ["inherit", "inherit", "inherit", "ipc"],
                }
            );
        } else if (
            filetype === "javascript" ||
            filetype === "commonjs" ||
            filetype === "esm"
        ) {
            subprocess = spawn("node", [filename, ...argv], {
                stdio: ["inherit", "inherit", "inherit", "ipc"],
            });
        }

        const pid = `${subprocess.pid}`;

        this.subprocess = subprocess;

        this.pid = pid;

        return this;
    }

    public async events({ onExit }) {
        const subprocess = this.subprocess;
        const consumers = this.consumers;

        subprocess.on("error", (err) => {
            console.error({ err });
        });

        subprocess.on("exit", (code = 0) => {
            onExit?.({ code });
        });

        subprocess.on("message", async (payload) => {
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
                                    { message: "Bad response on event" },
                                    {
                                        type: eventType,
                                        id: eventId,
                                    }
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
                                {
                                    type: eventType,
                                    id: eventId,
                                }
                            );
                        }
                    }
                }
            } else if (isFunction(consumers)) {
                try {
                    const response = await consumers({
                        data: rest.data,
                    });
                    if (response instanceof Function) {
                        await this.sendError(
                            { message: "Bad response on event" },
                            { id: eventId }
                        );
                        return;
                    }
                    await this.sendData(response, { id: eventId });
                } catch (error: any) {
                    await this.sendError(
                        { message: error.message },
                        { id: eventId }
                    );
                }
            }
        });

        return this;
    }

    /**
     * 1: isRunning() && send(); - fix: Error [ERR_IPC_CHANNEL_CLOSED]: Channel closed
     * 2: new Promise(reject(new Error()) = Channel closed - Safe: throw new Error());
     */
    private async isRunning() {
        return new ProcessManager().isProcessRunning(this.pid);
    }

    public async stop(): Promise<void> {
        try {
            if (this.subprocess && (await this.isRunning())) {
                await new ProcessManager().kill(this.pid);
            }
        } catch (error) {
            console.error({ error });
        }
    }

    private async send(payload?: ITransportMessage, options?) {
        if (
            this.subprocess &&
            this.subprocess?.send &&
            (await this.isRunning())
        ) {
            this.subprocess?.send?.({
                data: payload?.data,
                error: payload?.error,
                ...options,
            } as IEventResponseType);
        }
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
