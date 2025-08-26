import {
    IStepMessage,
    IStepMessagePayload,
} from "@/shared/interfaces/IStepMessage";

import { Exception } from "@/shared/errors/Exception";
import { IMessageConsumerBase } from "@/shared/interfaces/IMessageConsumerBase";
import { InMemoryDatabase } from "../database/InMemoryDatabase";
import { OnCreateConsumer } from "./base/OnCreateConsumer";
import { TransportType } from "@/shared/enums/TransportType";

type ConsumerId = number;

export class MessageConsumerBase {
    private _consumers: Record<ConsumerId, IMessageConsumerBase> = {};
    private _idCounter: number = 1;

    private _transport: TransportType | undefined;
    private _hooks:
        | Array<IStepMessage>
        | ((arg: IStepMessagePayload<any>) => Promise<any>);
    private _filename: string | undefined;
    private exitHandler?: (args: { id: ConsumerId; code: number }) => void;
    private stopHandler?: (args: { id: ConsumerId }) => void;

    public transport(name: TransportType) {
        this._transport = name;
        InMemoryDatabase.getInstance().setTransport(name);
        return this;
    }

    public getTransport() {
        return this._transport;
    }

    public filename(filename: string) {
        this._filename = filename;
        return this;
    }

    public getFilename() {
        return this._filename;
    }

    public consumers(
        consumers: Array<IStepMessage> | ((arg: { data: any }) => Promise<any>)
    ) {
        this._hooks = consumers;
        return this;
    }

    public getHooks() {
        return this._hooks;
    }

    public async stop(id: ConsumerId) {
        if (!this._consumers[id]) {
            return;
        }
        try {
            await this._consumers[id].stop();
        } finally {
            delete this._consumers[id];
            this.stopHandler?.({ id });
        }
    }

    public async create<P>(data?: {
        params?: P;
    }): Promise<{ id: ConsumerId; pid: string | null }> {
        if (!this._filename?.length) {
            throw new Exception("Invalid filename");
        }

        if (!this.getTransport()?.length) {
            throw new Exception("Transport required");
        }

        if (
            ![
                TransportType.MEMORY,
                TransportType.PROCESS,
                TransportType.WORKER,
            ].includes(this.getTransport())
        ) {
            throw new Exception("Invalid transport");
        }

        const { params = {} } = data || {};
        const id = this._idCounter++;

        const messager = await new OnCreateConsumer({
            transport: this.getTransport(),
        }).execute({
            filename: this._filename,
            params,
            consumers: this.getHooks(),
            onExit: async ({ code = 0 }) => {
                await this.stop(id);
                this.exitHandler?.({ id, code });
            },
        });

        this._consumers[id] = messager;

        return { id, pid: messager.getPID() };
    }

    public onExit(handler: (args: { id: ConsumerId; code: number }) => void) {
        this.exitHandler = handler;
        return this;
    }

    public onStop(handler: (args: { id: ConsumerId }) => void) {
        this.stopHandler = handler;
        return this;
    }

    public exists(id: ConsumerId): boolean {
        return !!this._consumers[id];
    }

    public listConsumers(): ConsumerId[] {
        return Object.keys(this._consumers).map(Number);
    }
}
