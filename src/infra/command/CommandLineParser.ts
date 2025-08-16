import { ArgumentsParse, CommandParser } from "acmdp";

export class CommandLineParser {
    public async execute(argv: string[]) {
        const argvFull = `${[...argv].join(" ")}`;
        let params = {};
        if (argvFull?.length > 0) {
            const parserCommand = new CommandParser(argvFull).parse();
            if (parserCommand.argv?.length > 0) {
                params = new ArgumentsParse(parserCommand.argv).parse();
            }
        }
        return {
            params,
        };
    }
}
