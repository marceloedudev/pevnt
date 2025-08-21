import { ChildProcess, spawn } from "node:child_process";
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

import { IProcessManager } from "@/shared/process/IProcessManager";
import { ProcessFactory } from "@/infra/process/ProcessFactory";
import { isFunction } from "@/shared/utils/Check";

/**
 * Error [ERR_IPC_CHANNEL_CLOSED]: Channel closed
 * 1: isRunning() && send();
 * 2: new Promise(reject(new Error()) = Channel closed - Safe: throw new Error());
 */
export class ConsumerHandlerIPC implements IMessageConsumerBase {
    private subprocess!: ChildProcess;
    private pid!: string;
    private consumers!:
        | Array<IStepMessage>
        | ((arg: IStepMessagePayload<any>) => Promise<any>);

    private processManager: IProcessManager;

    constructor() {
        const processFactory = new ProcessFactory();
        this.processManager = processFactory.createProcessManager();
    }

    public async register({
        filename,
        filetype,
        params,
        argv,
        consumers,
    }: IMessageConsumerRegister): Promise<IMessageConsumerBase> {
        this.consumers = consumers;

        const spawnMap: Record<string, [string, string[]]> = {
            typescript: [
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
            ],
            javascript: ["node", [filename, ...argv]],
            commonjs: ["node", [filename, ...argv]],
            esm: ["node", [filename, ...argv]],
        };

        const [cmd, args] = spawnMap[filetype];
        this.subprocess = spawn(cmd, args, {
            stdio: ["inherit", "inherit", "inherit", "ipc"],
        });
        this.pid = `${this.subprocess.pid}`;
        return this;
    }

    public async events({ onExit }): Promise<IMessageConsumerBase> {
        const { subprocess, consumers } = this;

        subprocess.on("error", (err) => console.error({ err }));
        subprocess.on("exit", (code) => onExit?.({ code: code ?? 0 }));
        subprocess.on("message", async (payload) =>
            this.handleMessage(payload, consumers)
        );

        return this;
    }

    private async handleMessage(
        payload: any,
        consumers: typeof this.consumers
    ) {
        const { type, ...rest } = payload || {};
        const eventId = `${rest?.id}`;

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

    private async isRunning() {
        return this.processManager.isProcessRunning(this.pid);
    }

    public async stop(): Promise<void> {
        try {
            if (this.subprocess && (await this.isRunning())) {
                await this.processManager.kill(this.pid);
            }
        } catch (error) {
            console.error({ error });
        }
    }

    private async send(payload?: ITransportMessage, options?): Promise<void> {
        try {
            if (this.subprocess?.send && (await this.isRunning())) {
                this.subprocess.send({
                    data: payload?.data,
                    error: payload?.error,
                    ...options,
                } as IEventResponseType);
            }
        } catch (error) {
            console.error({ error });
        }
    }

    private async sendData(data, options: { type?: string; id: string }) {
        await this.send({ data }, options);
    }

    private async sendError(error, options: { type?: string; id: string }) {
        await this.send({ error }, options);
    }
}
