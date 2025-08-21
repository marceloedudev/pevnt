import { CommandParser } from "acmdp";
import { ICommandParser } from "@/shared/acmdp/ICommandParser";
import { IParsedCommand } from "@/shared/acmdp/IParsedCommand";

export class CommandParserAdapter implements ICommandParser {
    public parse(input: string): IParsedCommand {
        return new CommandParser(input).parse();
    }
}
