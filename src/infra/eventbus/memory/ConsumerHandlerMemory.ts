import {
    IMessageConsumerBase,
    IMessageConsumerRegister,
} from "@/shared/interfaces/IMessageConsumerBase";

import { Delay } from "@/shared/utils/Delay";
import { FileImport } from "@/domain/entity/FileImport";
import { InMemoryDatabase } from "@/infra/database/InMemoryDatabase";
import path from "node:path";

export class ConsumerHandlerMemory implements IMessageConsumerBase {
    private database: InMemoryDatabase;

    constructor() {
        this.database = InMemoryDatabase.getInstance();
    }

    public async register({
        filename,
        filetype,
        params,
        argv,
        consumers,
    }: IMessageConsumerRegister): Promise<IMessageConsumerBase> {
        this.database.setConsumers(consumers);

        const originalArgv = process.argv;
        process.argv = [...argv];

        const file = new FileImport(
            path.resolve(path.join(filename))
        ).normalize();

        const cmd = await import(`${file}`);

        await cmd.main();

        process.argv = originalArgv;

        await Delay(100);

        return this;
    }

    public async events({
        onExit,
    }: {
        onExit: any;
    }): Promise<IMessageConsumerBase> {
        return this;
    }

    public async stop(): Promise<void> {}

    public getPID(): string | null {
        return null;
    }
}
