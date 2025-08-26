import {
    IStepMessage,
    IStepMessagePayload,
} from "@/shared/interfaces/IStepMessage";

import { TransportType } from "@/shared/enums/TransportType";

export class InMemoryDatabase {
    private static instance: InMemoryDatabase;

    private consumers:
        | Array<IStepMessage>
        | ((arg: IStepMessagePayload<any>) => Promise<any>) = [];

    private transport: TransportType | null = null;

    private constructor() {}

    public static getInstance(): InMemoryDatabase {
        if (!InMemoryDatabase.instance) {
            InMemoryDatabase.instance = new InMemoryDatabase();
        }
        return InMemoryDatabase.instance;
    }

    public setConsumers(
        consumers:
            | Array<IStepMessage>
            | ((arg: IStepMessagePayload<any>) => Promise<any>)
    ): void {
        this.consumers = consumers;
    }

    public getConsumers():
        | Array<IStepMessage>
        | ((arg: IStepMessagePayload<any>) => Promise<any>) {
        return this.consumers || [];
    }

    public reset(): void {
        this.consumers = [];
        this.transport = null;
    }

    public setTransport(value: TransportType): void {
        this.transport = value;
    }

    public getTransport(): TransportType {
        return this.transport;
    }
}
