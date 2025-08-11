import CommandParser from "@/domain/text/parse/CommandParser";
import Delay from "@/domain/timers/Delay";
import IConsumerAbstraction from "@/domain/eventbus/IConsumerAbstraction";
import { ReplaceSrcWithAlias } from "@/domain/text/replace/ReplaceText";
import path from "path";

export default class MessageConsumerHandlerMemory
    implements IConsumerAbstraction
{
    public async register({
        command,
        consumers,
    }): Promise<IConsumerAbstraction> {
        globalThis?.fakeDatabase?.setConsumers(consumers);

        const parsedCommand = new CommandParser(
            command.getCommandArgs().join(" ")
        ).parse();

        const originalArgv = process.argv;
        process.argv = [...parsedCommand.argv];

        const filename = ReplaceSrcWithAlias(
            path.resolve(path.join(parsedCommand.filename))
        );

        const cmd = await import(`${filename}`);

        await cmd.main();

        process.argv = originalArgv;

        await Delay(1000);

        return this;
    }

    public async events({
        onExit,
    }: {
        onExit: any;
    }): Promise<IConsumerAbstraction> {
        return this;
    }

    public stop(): Promise<void> {
        return;
    }
}
