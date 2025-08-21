import { IArgumentsParser } from "@/shared/acmdp/IArgumentsParser";
import { ICommandParser } from "@/shared/acmdp/ICommandParser";
import { ParserFactory } from "@/infra/acmdp/ParserFactory";

export class Arguments {
    private argumentsParser: IArgumentsParser;
    private commandParser: ICommandParser;

    constructor(private readonly argv: string[]) {
        const parserFactory = new ParserFactory();
        this.argumentsParser = parserFactory.createArgumentsParser();
        this.commandParser = parserFactory.createCommandParser();
    }

    public parse() {
        const argvInline = `${[...this.argv].join(" ")}`;
        let params = {};
        if (argvInline?.length > 0) {
            const parserCommand = this.commandParser.parse(argvInline);
            if (parserCommand.argv?.length > 0) {
                params = this.argumentsParser.parse(parserCommand.argv);
            }
        }
        return params;
    }
}
