export default abstract class EventCommandIPC {
    private readonly command: string;
    private readonly commandArgs: string[];

    constructor({ command, commandArgs }) {
        this.command = command;
        this.commandArgs = commandArgs;
    }

    public getCommand(): string {
        return this.command;
    }

    public getCommandArgs(): string[] {
        return this.commandArgs;
    }
}
