import BadRequestException from "@/domain/error/BadRequestException";
import NotFoundException from "@/domain/error/NotFoundException";

type ParsedCommand = {
    command: string;
    execArgv: string[];
    filename: string;
    filenameOption: string[];
    argv: string[];
};

export default class CommandParser {
    private input: string;
    private parts: string[];

    constructor(input: string) {
        this.input = input?.trim();
        if (!this.input) {
            throw new NotFoundException("Empty input command");
        }
        const invalidFlags = this.filterInvalidShortFlags(
            this.extractSingleDashKeys(this.input)
        );
        if (invalidFlags.length) {
            throw new BadRequestException(
                `Bad arguments: ${invalidFlags.join(",")}`
            );
        }
        this.parts = this.tokenize(this.input);
    }

    public parse(): ParsedCommand {
        let command = "";
        let filename = "";
        let execArgv: string[] = [];
        let filenameOption: string[] = [];
        let argv: string[] = [];

        // 1. Detect command at beginning (before any flag)
        for (let i = 0; i < this.parts.length; i++) {
            const part = this.parts[i];
            if (part.startsWith("-")) break;
            if (
                !part.startsWith("-") &&
                !this.hasExtension(part) &&
                !part.startsWith(".")
            ) {
                command = part;
                break;
            }
        }

        const commandIndex = this.parts.indexOf(command);
        const remaining = [...this.parts];
        if (commandIndex !== -1) {
            remaining.splice(commandIndex, 1);
        }

        // 2. Detect filename (last one)
        const filenameIdx = (() => {
            let index = -1;
            for (let i = 0; i < remaining.length; i++) {
                if (this.isFilename(remaining[i])) {
                    index = i;
                }
            }
            return index;
        })();

        if (filenameIdx !== -1) {
            filename = remaining[filenameIdx];

            execArgv = remaining
                .slice(0, filenameIdx)
                .flatMap((arg) => this.splitArgOnEquals(arg))
                .filter(Boolean);

            let i = filenameIdx + 1;
            while (i < remaining.length && !remaining[i].startsWith("-")) {
                filenameOption.push(remaining[i]);
                i++;
            }

            const rawArgv = remaining.slice(i);
            argv = rawArgv
                .flatMap((arg) => this.splitArgOnEquals(arg))
                .filter(Boolean);
        } else {
            argv = remaining
                .flatMap((arg) => this.splitArgOnEquals(arg))
                .filter(Boolean);
        }

        return {
            command,
            execArgv,
            filename,
            filenameOption,
            argv,
        };
    }

    private cleanInput(text: string): string {
        return text
            .replace(/"[^"]*"/g, "")
            .replace(/\$\([^)]*\)/g, "")
            .replace(/\([^)]*\)/g, "");
    }

    private extractSingleDashKeys(text: string): string[] {
        const cleaned = this.cleanInput(text);
        const tokens = cleaned.trim().split(/\s+/);
        return tokens
            .filter((token) => token.startsWith("-") && !token.startsWith("--"))
            .map((token) =>
                token.includes("=") ? token.split("=")[0] : token
            );
    }

    private filterInvalidShortFlags(flags: string[]): string[] {
        return flags.filter((flag) => /^-.{2,}$/.test(flag));
    }

    private hasExtension(value: string): boolean {
        return (
            value.endsWith(".js") ||
            value.endsWith(".ts") ||
            value.endsWith(".mjs") ||
            value.endsWith(".cjs")
        );
    }

    private tokenize(input: string): string[] {
        const result: string[] = [];
        let current: string = "";
        let quote: '"' | "'" | null = null;
        let escape = false;
        let parenDepth = 0;
        let inSubshell = false;
        let i = 0;

        const spaceRegex = /\s/;
        const quoteRegex = /^['"]/;
        const escapeRegex = /^\\$/;
        const subshellStartRegex = /^\$\(/;

        while (i < input.length) {
            const char = input[i];

            if (escape) {
                current += char;
                escape = false;
            } else if (escapeRegex.test(char)) {
                current += char;
                escape = true;
            } else if (quote) {
                current += char;
                if (char === quote) quote = null;
            } else if (quoteRegex.test(char)) {
                current += char;
                quote = char as '"' | "'";
            } else if (!quote && subshellStartRegex.test(input.slice(i))) {
                current += "$(";
                inSubshell = true;
                parenDepth = 1;
                i++;
            } else if (inSubshell) {
                current += char;
                if (char === "(") parenDepth++;
                else if (char === ")") {
                    parenDepth--;
                    if (parenDepth === 0) inSubshell = false;
                }
            } else if (spaceRegex.test(char)) {
                if (current) {
                    result.push(current);
                    current = "";
                }
            } else {
                current += char;
            }

            i++;
        }

        if (current) {
            result.push(current);
        }

        return result;
    }

    private splitArgOnEquals(arg: string): string[] {
        const isEnvironmentVariableWindows = /^set\s+\w+=/i.test(arg);
        if (isEnvironmentVariableWindows) {
            return [arg];
        }
        const isEnvironmentVariableLinux = /^[A-Za-z_][A-Za-z0-9_]*=/.test(arg);
        if (isEnvironmentVariableLinux) {
            return [arg];
        }
        if (!arg.includes("=") || arg.startsWith('"') || arg.startsWith("'")) {
            return [arg];
        }
        const index = arg.indexOf("=");
        const key = arg.slice(0, index);
        const value = arg.slice(index + 1);
        return value ? [key, value] : [key];
    }

    private isFilename(value: string): boolean {
        return (
            value.endsWith(".js") ||
            value.endsWith(".ts") ||
            value.endsWith(".mjs") ||
            value.endsWith(".cjs") ||
            value === "." ||
            value.startsWith(".") ||
            value.startsWith("./") ||
            value.startsWith("/")
        );
    }
}
