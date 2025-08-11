import EventCommand from "@/domain/eventbus/EventCommand";

export default class CallConsumerCommand extends EventCommand {
    constructor() {
        const commandArgs = [
            "--transpile-only",
            "-r",
            "ts-node/register",
            "-r",
            "tsconfig-paths/register",
            "./src/commands/call-command.ts",
        ];
        super({
            command: "ts-node",
            commandArgs,
        });
    }
}
