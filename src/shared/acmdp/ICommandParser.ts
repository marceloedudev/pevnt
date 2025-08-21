import { IParsedCommand } from "./IParsedCommand";

export interface ICommandParser {
    parse(input: string): IParsedCommand;
}
