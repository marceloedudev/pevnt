export interface IArgumentsParser {
    parse(input: string[]): any;
    unparse(obj: Record<string, any>): string[];
}
