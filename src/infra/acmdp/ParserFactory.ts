import { ArgumentsParserAdapter } from "./ArgumentsParserAdapter";
import { CommandParserAdapter } from "./CommandParserAdapter";
import { IArgumentsParser } from "@/shared/acmdp/IArgumentsParser";
import { ICommandParser } from "@/shared/acmdp/ICommandParser";

export class ParserFactory {
    public createArgumentsParser(): IArgumentsParser {
        return new ArgumentsParserAdapter();
    }

    public createCommandParser(): ICommandParser {
        return new CommandParserAdapter();
    }
}
