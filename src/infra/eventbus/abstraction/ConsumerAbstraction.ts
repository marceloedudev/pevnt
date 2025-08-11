import EventCommand from "@/domain/eventbus/EventCommand";
import { EventEmitter } from "events";
import IConsumerAbstraction from "@/domain/eventbus/IConsumerAbstraction";
import IStepAbstraction from "@/domain/eventbus/IStepAbstraction";
import ITransportType from "@/domain/eventbus/ITransportType";
import MessageConsumerHandlerIPC from "../ipc/MessageConsumerHandlerIPC";
import MessageConsumerHandlerMemory from "../memory/MessageConsumerHandlerMemory";
import MessageConsumerHandlerWorker from "../worker/MessageConsumerHandlerWorker";

type ConsumerId = string | number;

export default abstract class ConsumerAbstraction {
    private _events: EventEmitter = new EventEmitter();
    private _consumers: Record<ConsumerId, IConsumerAbstraction> = {};
    private _idCounter: number = 1;

    public abstract transport(): ITransportType;

    public abstract getCommand(params?: any): EventCommand;

    public abstract getConsumers():
        | Array<IStepAbstraction>
        | ((arg: { data: any }) => Promise<any>);

    constructor() {
        this._events.on("killWorker", async (id: ConsumerId) => {
            await this.stop(id);
        });
    }

    public async stop(id: ConsumerId) {
        console.log("Worker/Process .stop() ", { id });
        if (!this._consumers[id]) {
            console.log(`Worker/Process ${id} not found`);
            return;
        }
        try {
            await this._consumers[id].stop();
        } finally {
            delete this._consumers[id];
        }
    }

    private getImplementation(): IConsumerAbstraction {
        if (process.env.NODE_ENV === "test") {
            return new MessageConsumerHandlerMemory();
        } else {
            const transport = this["transport"]();
            if (transport === ITransportType.WORKER) {
                return new MessageConsumerHandlerWorker();
            } else if (transport === ITransportType.PROCESS) {
                return new MessageConsumerHandlerIPC();
            }
            return new MessageConsumerHandlerWorker();
        }
    }

    public async create(data: { params?: any }): Promise<{ id: ConsumerId }> {
        const { params } = data || {};
        const id = this._idCounter++;
        const worker = await this.getImplementation().register({
            command: this["getCommand"](params ?? {}),
            consumers: this["getConsumers"](),
        });
        console.log({ consumerId: id, data });
        await worker.events({
            onExit: async ({ code }) => {
                await this.stop(id);
            },
        });
        this._consumers[id] = worker;
        return { id };
    }

    public on(event: string, listener: (...args: any[]) => void): void {
        this._events.on(event, listener);
    }

    public emit(event: string, ...args: any[]): void {
        this._events.emit(event, ...args);
    }

    public listWorkers(): ConsumerId[] {
        return Object.keys(this._consumers).map(Number);
    }
}
