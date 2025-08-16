import { Delay } from "@/shared/utils/Delay";
import { DetectFileType } from "@/shared/utils/DetectFileType";
import { Exception } from "@/shared/errors/Exception";
import { ICommandInput } from "@/shared/interfaces/ICommandInput";
import { IMessageConsumerBase } from "@/shared/interfaces/IMessageConsumerBase";
import { ReplaceSrcWithAlias } from "@/domain/text/Replace";
import path from "node:path";

export class ConsumerHandlerMemory implements IMessageConsumerBase {
    public async register({
        command,
        consumers,
    }: {
        command: ICommandInput;
        consumers: any;
    }): Promise<IMessageConsumerBase> {
        globalThis?.fakeDatabase?.setConsumers(consumers);

        const { filename, argv = [] } = command;

        const filetype = DetectFileType(filename);

        if (filetype === "unknown") {
            throw new Exception("Invalid type file");
        }

        const originalArgv = process.argv;
        process.argv = [...argv];

        const file = ReplaceSrcWithAlias(path.resolve(path.join(filename)));

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

    public stop(): Promise<void> {
        return;
    }
}
