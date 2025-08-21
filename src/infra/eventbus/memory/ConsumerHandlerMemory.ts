import {
    IMessageConsumerBase,
    IMessageConsumerRegister,
} from "@/shared/interfaces/IMessageConsumerBase";

import { Delay } from "@/shared/utils/Delay";
import { FileImport } from "@/domain/entity/FileImport";
import path from "node:path";

export class ConsumerHandlerMemory implements IMessageConsumerBase {
    public async register({
        filename,
        filetype,
        params,
        argv,
        consumers,
    }: IMessageConsumerRegister): Promise<IMessageConsumerBase> {
        globalThis?.pevntFakeDatabase?.setConsumers(consumers);

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
}
