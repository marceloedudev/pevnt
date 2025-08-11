import ArgumentsParse from "@/domain/text/parse/ArgumentsParse";
import CommandParser from "@/domain/text/parse/CommandParser";

export default class ParserCommandLine {
    public async execute(argv: string[]) {
        const command = `${[...argv].join(" ")}`;
        const parserCommand = new CommandParser(command).parse();
        const params: any =
            parserCommand.argv?.length > 0
                ? new ArgumentsParse(parserCommand.argv).parse()
                : {};
        return {
            params: {
                ...params,
            },
        };
    }
}
