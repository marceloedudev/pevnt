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

import { ErrorTransport } from "@/domain/entity/ErrorTransport";
import { Exception } from "@/shared/errors/Exception";

export class ConsumerHandlerIPC implements IMessageConsumerBase {
    private subprocess!: ChildProcess;
    private pid!: string;
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
            // stdio: ["pipe", "pipe", "pipe", "ipc"],
        });
        this.pid = `${this.subprocess.pid}`;
        return this;
    }

    public async events({ onExit }): Promise<IMessageConsumerBase> {
        const { subprocess, consumers } = this;

        subprocess.on("error", (err) => {
            throw new Exception(`Failed process: ${err?.message}`);
        });

        subprocess.on("exit", (code) => onExit?.({ code: code ?? 0 }));

        subprocess.on("message", async (payload) =>
            this.handleMessage(payload, consumers)
        );

        // Pipe (error handle):

        // let stderr = "";

        // subprocess.stderr.on("data", (data) => {
        //     stderr += data.toString();
        // });

        // subprocess.on("close", (code) => {
        //     const statusCode = code || 0;
        //     if (statusCode !== 0) {
        //         const match = stderr.match(/Error:\s*(.+)/);
        //         throw new Exception(
        //             `Process exited with code ${statusCode} - ${
        //                 match ? match[1] : stderr.trim()
        //             }`
        //         );
        //     }
        // });

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
            } else if (typeof consumers === "function") {
                const response = await consumers({ data: rest.data });
                await safeRespond(response, { id: eventId });
            }
        } catch (error) {
            await this.sendError(
                { ...new ErrorTransport().serialize(error) },
                { type, id: eventId }
            );
        }
    }

    public async stop(): Promise<void> {
        if (this.subprocess && this.subprocess.connected) {
            this.subprocess.kill();
        }
    }

    public getPID(): string | null {
        return this.pid;
    }

    private async send(payload?: ITransportMessage, options?): Promise<void> {
        try {
            if (this.subprocess?.send && this.subprocess.connected) {
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
