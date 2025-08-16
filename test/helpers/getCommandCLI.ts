import { CommandParser } from "acmdp";

export function getCommandCLI({ file }) {
    const input = `npx cross-env NODE_ENV=development ts-node --transpile-only -r ts-node/register -r tsconfig-paths/register ${file}`;
    return new CommandParser(input).parse();
}
