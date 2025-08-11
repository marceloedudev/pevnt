import EventCommand from "@/domain/eventbus/EventCommand";

export default class ItemConsumerCommand extends EventCommand {
    constructor({ itemId }) {
        const commandArgs = [
            "--transpile-only",
            "-r",
            "ts-node/register",
            "-r",
            "tsconfig-paths/register",
            "./src/commands/item-command.ts",
            "--itemid",
            `${itemId}`,
        ];
        super({
            command: "ts-node",
            commandArgs,
        });
    }
}
