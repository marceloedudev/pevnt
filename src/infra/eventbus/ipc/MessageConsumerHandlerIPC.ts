import { ChildProcess, spawn } from "node:child_process";

import IConsumerAbstraction from "@/domain/eventbus/IConsumerAbstraction";
import { IEventPayload } from "@/domain/eventbus/IEventResponseType";
import ProcessManager from "../ProcessManager";
import StepAbstraction from "../abstraction/StepAbstraction";
import { isFunction } from "@/domain/helpers/methods";

export default class MessageConsumerHandlerIPC implements IConsumerAbstraction {
    private subprocess!: ChildProcess;

    private pid!: string;

    private consumers!:
        | Array<StepAbstraction>
        | ((arg: { data: any }) => Promise<any>);

    public async register({
        command,
        consumers,
    }): Promise<IConsumerAbstraction> {
        this.consumers = consumers;

        const subprocess = spawn(
            command.getCommand(),
            [...command.getCommandArgs()],
            {
                stdio: ["inherit", "inherit", "inherit", "ipc"],
            }
        );

        const pid = `${subprocess.pid}`;

        this.subprocess = subprocess;

        this.pid = pid;

        return this;
    }

    public async events({ onExit }) {
        const subprocess = this.subprocess;
        const consumers = this.consumers;

        subprocess.on("error", (err) => {
            console.log({ err, subprocess });
        });

        subprocess.stdout?.on("data", (data) => {
            console.log(`stdout: ${data}`);
        });

        subprocess.stderr?.on("data", (data) => {
            console.error(`stderr: ${data}`);
        });

        subprocess.on("exit", (code) => {
            onExit?.({ code });
        });

        subprocess.on("close", (code) => {
            console.log(`child process exited - code: ${code}`);
        });

        subprocess.on("message", async (payload) => {
            const { type, ...rest }: any = payload || {};
            const eventId = `${rest?.id}`;
            if (Array.isArray(consumers) && consumers?.length > 0) {
                for await (const consumer of consumers) {
                    const eventType = consumer.getStatus().getName();
                    if (type === eventType) {
                        try {
                            const response = await consumer.onMessage({
                                type,
                                ...rest,
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
                            await this.sendData(response || true, {
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
                        type,
                        ...rest,
                    });
                    if (response instanceof Function) {
                        await this.sendError(
                            { message: "Bad response on event" },
                            { id: eventId }
                        );
                        return;
                    }
                    await this.sendData(response || true, { id: eventId });
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
        if (this.subprocess && (await this.isRunning())) {
            await new ProcessManager().kill(this.pid);
            await new Promise((resolve) => {
                this.subprocess?.once("close", resolve);
            });
            this.subprocess = null as any;
        }
    }

    private async send(payload?: IEventPayload, options?) {
        if (
            this.subprocess &&
            this.subprocess?.send &&
            (await this.isRunning())
        ) {
            this.subprocess?.send?.({
                data: payload?.data,
                error: payload?.error,
                ...options,
            });
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
