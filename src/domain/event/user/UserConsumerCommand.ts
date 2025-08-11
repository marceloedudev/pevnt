import EventCommand from "@/domain/eventbus/EventCommand";

export default class UserConsumerCommand extends EventCommand {
    constructor({ userId }) {
        const commandArgs = [
            "--tsconfig",
            "./tsconfig.json",
            "./src/commands/user-command.ts",
            "--userid",
            `${userId}`,
        ];
        super({
            command: "tsx",
            commandArgs,
        });
    }
}
