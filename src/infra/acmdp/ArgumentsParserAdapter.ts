import { ArgumentsParser } from "acmdp";
import { IArgumentsParser } from "@/shared/acmdp/IArgumentsParser";

export class ArgumentsParserAdapter implements IArgumentsParser {
    public parse(input: string[]) {
        return new ArgumentsParser(input).parse();
    }

    public unparse(object: Record<string, any>): string[] {
        return ArgumentsParser.unparse(object);
    }
}
