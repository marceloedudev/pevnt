import {
    IStepMessage,
    IStepMessagePayload,
} from "@/shared/interfaces/IStepMessage";

import { ICommandInput } from "@/shared/interfaces/ICommandInput";
import { IMessageConsumerBase } from "@/shared/interfaces/IMessageConsumerBase";
import { ITransportType } from "@/shared/interfaces/ITransportType";
import { MessageFactory } from "./factory/MessageFactory";

type ConsumerId = string | number;

type CommandHandler<P> = (input: { params: P }) => ICommandInput;

export class MessageConsumerBase {
    private _consumers: Record<ConsumerId, IMessageConsumerBase> = {};
    private _idCounter: number = 1;

    private _transport: ITransportType;
    private _command;
    private _hooks:
        | Array<IStepMessage>
        | ((arg: IStepMessagePayload<any>) => Promise<any>);

    public transport(name: ITransportType) {
        this._transport = name;
        return this;
    }

    public command<P>(handler: CommandHandler<P>) {
        this._command = (params): ICommandInput => {
            return handler({ params });
        };
        return this;
    }

    public getCommand() {
        return this._command;
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
        }
    }

    public async create<P>(data: { params?: P }): Promise<{ id: ConsumerId }> {
        const { params } = data || {};
        const id = this._idCounter++;
        const transport = this._transport;
        const worker = await new MessageFactory()
            .createMessageConsumer(transport)
            .register({
                command: this._command(params ?? {}),
                consumers: this.getHooks(),
            });
        await worker.events({
            onExit: async ({ code }) => {
                await this.stop(id);
            },
        });
        this._consumers[id] = worker;
        return { id };
    }

    public listConsumers(): ConsumerId[] {
        return Object.keys(this._consumers).map(Number);
    }
}
