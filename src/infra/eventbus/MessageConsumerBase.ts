import {
    IStepMessage,
    IStepMessagePayload,
} from "@/shared/interfaces/IStepMessage";

import { Exception } from "@/shared/errors/Exception";
import { FileImport } from "@/domain/entity/FileImport";
import { IMessageConsumerBase } from "@/shared/interfaces/IMessageConsumerBase";
import { ITransportType } from "@/shared/interfaces/ITransportType";
import { MessageFactory } from "./factory/MessageFactory";
import { ParserFactory } from "../acmdp/ParserFactory";

type ConsumerId = number;

export class MessageConsumerBase {
    private _consumers: Record<ConsumerId, IMessageConsumerBase> = {};
    private _idCounter: number = 1;

    private _transport: ITransportType;
    private _hooks:
        | Array<IStepMessage>
        | ((arg: IStepMessagePayload<any>) => Promise<any>);
    private _filename: string;
    private exitHandler?: (args: { id: ConsumerId; code: number }) => void;
    private stopHandler?: (args: { id: ConsumerId }) => void;

    public transport(name: ITransportType) {
        this._transport = name;
        return this;
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

    public async create<P>(data: { params?: P }): Promise<{ id: ConsumerId }> {
        const { params = {} } = data || {};
        const id = this._idCounter++;
        const transport = this._transport;

        const filetype = new FileImport(this._filename).detectFileType();

        if (filetype === "unknown") {
            throw new Exception("Invalid type file");
        }

        const argv = new ParserFactory()
            .createArgumentsParser()
            .unparse(params);

        const messager = await new MessageFactory()
            .createMessageConsumer(transport)
            .register({
                filename: this._filename,
                filetype,
                params,
                argv,
                consumers: this.getHooks(),
            });
        await messager.events({
            onExit: async ({ code = 0 }) => {
                await this.stop(id);
                this.exitHandler?.({ id, code });
            },
        });
        this._consumers[id] = messager;
        return { id };
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
