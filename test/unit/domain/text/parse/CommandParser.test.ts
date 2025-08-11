// test/CommandParser.spec.ts

import { describe, it } from "mocha";

import CommandParser from "@/domain/text/parse/CommandParser";
import { expect } from "chai";

class TestableCommandParser extends CommandParser {
    public tokenizePublic(input: string): string[] {
        return this["tokenize"](input);
    }
    public isFilenamePublic(value: string): boolean {
        return this["isFilename"](value);
    }
    public hasExtensionPublic(value: string): boolean {
        return this["hasExtension"](value);
    }
}

describe("CommandParser", () => {
    describe("parse()", () => {
        const examples = [
            {
                input: "npm-run-all --parallel script1 script2",
                expected: {
                    command: "npm-run-all",
                    execArgv: [],
                    filename: "",
                    filenameOption: [],
                    argv: ["--parallel", "script1", "script2"],
                },
            },
            {
                input: 'start -x ./home/bin server.js --host=127.0.0.1 --port="3000"',
                expected: {
                    command: "start",
                    execArgv: ["-x", "./home/bin"],
                    filename: "server.js",
                    filenameOption: [],
                    argv: ["--host", "127.0.0.1", "--port", '"3000"'],
                },
            },
            {
                input: '--tsconfig ./tsconfig.json -r ts-node/register -r tsconfig-paths/register ./src/some.ts teste --user nickname --msg "hello world" -f=txt --random -c=8 --userid=10 --cmd="-r ./run.ts"',
                expected: {
                    command: "",
                    execArgv: [
                        "--tsconfig",
                        "./tsconfig.json",
                        "-r",
                        "ts-node/register",
                        "-r",
                        "tsconfig-paths/register",
                    ],
                    filename: "./src/some.ts",
                    filenameOption: ["teste"],
                    argv: [
                        "--user",
                        "nickname",
                        "--msg",
                        '"hello world"',
                        "-f",
                        "txt",
                        "--random",
                        "-c",
                        "8",
                        "--userid",
                        "10",
                        "--cmd",
                        '"-r ./run.ts"',
                    ],
                },
            },
            {
                input: 'node -r ./ensure-wrapped.js node_modules/mocha/$(npm view mocha bin.mocha) ./test.js -g=8 --true=10 --call="--asd=dsgds"',
                expected: {
                    command: "node",
                    execArgv: [
                        "-r",
                        "./ensure-wrapped.js",
                        "node_modules/mocha/$(npm view mocha bin.mocha)",
                    ],
                    filename: "./test.js",
                    filenameOption: [],
                    argv: [
                        "-g",
                        "8",
                        "--true",
                        "10",
                        "--call",
                        '"--asd=dsgds"',
                    ],
                },
            },
            {
                input: "node -r ./ensure-wrapped.js node_modules/mocha/$(npm view mocha bin.mocha) ./test.js",
                expected: {
                    command: "node",
                    execArgv: [
                        "-r",
                        "./ensure-wrapped.js",
                        "node_modules/mocha/$(npm view mocha bin.mocha)",
                    ],
                    filename: "./test.js",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: 'code . --item1=2 --item1="4" --item2=8 --item1="3d"',
                expected: {
                    command: "code",
                    execArgv: [],
                    filename: ".",
                    filenameOption: [],
                    argv: [
                        "--item1",
                        "2",
                        "--item1",
                        '"4"',
                        "--item2",
                        "8",
                        "--item1",
                        '"3d"',
                    ],
                },
            },
            {
                input: "code .",
                expected: {
                    command: "code",
                    execArgv: [],
                    filename: ".",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: "code",
                expected: {
                    command: "code",
                    execArgv: [],
                    filename: "",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: "file.js",
                expected: {
                    command: "",
                    execArgv: [],
                    filename: "file.js",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: "./src/main.ts -u 50",
                expected: {
                    command: "",
                    execArgv: [],
                    filename: "./src/main.ts",
                    filenameOption: [],
                    argv: ["-u", "50"],
                },
            },
            {
                input: "/usr/local/bin/node --require /home/node/app/node_modules/tsx/dist/preflight.cjs --import file:///home/node/app/node_modules/tsx/dist/loader.mjs ./src/main.ts -u 50",
                expected: {
                    command: "/usr/local/bin/node",
                    execArgv: [
                        "--require",
                        "/home/node/app/node_modules/tsx/dist/preflight.cjs",
                        "--import",
                        "file:///home/node/app/node_modules/tsx/dist/loader.mjs",
                    ],
                    filename: "./src/main.ts",
                    filenameOption: [],
                    argv: ["-u", "50"],
                },
            },
            {
                input: '-g=8 --true=10 --call="--asd=dsgds" --ppp --tsconfig ./tsconfig.json -r ts-node/register -r tsconfig-paths/register ./src/some.ts teste --user ^vPlayer_ --msg "hello world" -f=txt --random -c=8 --userid=10 --cmd="-r ./run.ts"',
                expected: {
                    command: "",
                    execArgv: [
                        "-g",
                        "8",
                        "--true",
                        "10",
                        "--call",
                        '"--asd=dsgds"',
                        "--ppp",
                        "--tsconfig",
                        "./tsconfig.json",
                        "-r",
                        "ts-node/register",
                        "-r",
                        "tsconfig-paths/register",
                    ],
                    filename: "./src/some.ts",
                    filenameOption: ["teste"],
                    argv: [
                        "--user",
                        "^vPlayer_",
                        "--msg",
                        '"hello world"',
                        "-f",
                        "txt",
                        "--random",
                        "-c",
                        "8",
                        "--userid",
                        "10",
                        "--cmd",
                        '"-r ./run.ts"',
                    ],
                },
            },
            {
                input: "run script.js --flag=value -v",
                expected: {
                    command: "run",
                    execArgv: [],
                    filename: "script.js",
                    filenameOption: [],
                    argv: ["--flag", "value", "-v"],
                },
            },
            {
                input: `run app.js --name="My App" -d`,
                expected: {
                    command: "run",
                    execArgv: [],
                    filename: "app.js",
                    filenameOption: [],
                    argv: ["--name", `"My App"`, "-d"],
                },
            },
            {
                input: `npx cross-env NODE_ENV=test mocha --no-timeout`,
                expected: {
                    command: "npx",
                    execArgv: [],
                    filename: "",
                    filenameOption: [],
                    argv: [
                        "cross-env",
                        "NODE_ENV=test",
                        "mocha",
                        "--no-timeout",
                    ],
                },
            },
            {
                input: `set NODE_ENV=test && node your_app.js`,
                expected: {
                    command: "set",
                    execArgv: ["NODE_ENV=test", "&&", "node"],
                    filename: "your_app.js",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: `$env:NODE_ENV="test"; node your_app.js`,
                expected: {
                    command: `$env:NODE_ENV="test";`,
                    execArgv: ["node"],
                    filename: "your_app.js",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: `tsx --tsconfig ./tsconfig.json ./src/Main.ts`,
                expected: {
                    command: "tsx",
                    execArgv: ["--tsconfig", "./tsconfig.json"],
                    filename: "./src/Main.ts",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: `build`,
                expected: {
                    command: "build",
                    execArgv: [],
                    filename: "",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: "./",
                expected: {
                    command: "",
                    execArgv: [],
                    filename: "./",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: ".",
                expected: {
                    command: "",
                    execArgv: [],
                    filename: ".",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: "npx cross-env NODE_ENV=development ts-node --transpile-only -r ts-node/register -r tsconfig-paths/register ./src/Main.ts",
                expected: {
                    command: "npx",
                    execArgv: [
                        "cross-env",
                        "NODE_ENV=development",
                        "ts-node",
                        "--transpile-only",
                        "-r",
                        "ts-node/register",
                        "-r",
                        "tsconfig-paths/register",
                    ],
                    filename: "./src/Main.ts",
                    filenameOption: [],
                    argv: [],
                },
            },
            {
                input: "ts-node --transpile-only ./src/Main.ts",
                expected: {
                    command: "ts-node",
                    execArgv: ["--transpile-only"],
                    filename: "./src/Main.ts",
                    filenameOption: [],
                    argv: [],
                },
            },
        ];

        examples.forEach(({ input, expected }, idx) => {
            it(`Example #${idx + 1}: parses '${input}' correctly`, () => {
                const result = new CommandParser(input).parse();
                expect(result).to.deep.equal(expected);
            });
        });

        it("throws BadRequestException on empty input", () => {
            expect(() => new CommandParser("")).to.throw("Empty input command");
        });

        it("throws BadRequestException on invalid short flag -abc", () => {
            expect(() => new CommandParser("-abc value")).to.throw(
                "Bad arguments: -abc"
            );
        });

        it("throws BadRequestException on multiple invalid short flags", () => {
            expect(() => new CommandParser("-abc -xx -yz")).to.throw(
                "Bad arguments: -abc,-xx,-yz"
            );
        });

        it("throws BadRequestException on single dash + equal sign invalid syntax", () => {
            expect(() => new CommandParser("-foo=bar")).to.throw(
                "Bad arguments: -foo"
            );
        });
    });

    describe("tokenize()", () => {
        const parser = new TestableCommandParser("echo");

        it("handles quoted values", () => {
            const tokens = parser.tokenizePublic('--msg "hello world"');
            expect(tokens).to.deep.equal(["--msg", '"hello world"']);
        });

        it("handles subshells", () => {
            const tokens = parser.tokenizePublic("$(echo hi)");
            expect(tokens).to.deep.equal(["$(echo hi)"]);
        });

        it("handles paths with subshells", () => {
            const tokens = parser.tokenizePublic(
                "node_modules/mocha/$(npm view mocha bin.mocha)"
            );
            expect(tokens).to.deep.equal([
                "node_modules/mocha/$(npm view mocha bin.mocha)",
            ]);
        });
    });

    describe("splitArgOnEquals()", () => {
        let parser;

        beforeEach(() => {
            parser = new CommandParser("echo test");
        });

        it("should keep Linux environment variable intact", () => {
            const result = parser["splitArgOnEquals"]("NODE_ENV=test");
            expect(result).to.deep.equal(["NODE_ENV=test"]);
        });

        it("should keep Windows set environment variable intact", () => {
            const result = parser["splitArgOnEquals"]("set NODE_ENV=test");
            expect(result).to.deep.equal(["set NODE_ENV=test"]);
        });

        it("should split regular arguments with equals", () => {
            const result = parser["splitArgOnEquals"]("--env=prod");
            expect(result).to.deep.equal(["--env", "prod"]);
        });

        it("should not split quoted arguments with equals", () => {
            const result = parser["splitArgOnEquals"]('"--env=prod"');
            expect(result).to.deep.equal(['"--env=prod"']);
        });

        it("should not split arguments without equals", () => {
            const result = parser["splitArgOnEquals"]("--verbose");
            expect(result).to.deep.equal(["--verbose"]);
        });

        it("should handle empty value after equals", () => {
            const result = parser["splitArgOnEquals"]("--flag=");
            expect(result).to.deep.equal(["--flag"]);
        });
    });

    describe("isFilename()", () => {
        const parser = new TestableCommandParser("echo");

        it("recognizes JS/TS files", () => {
            expect(parser.isFilenamePublic("file.js")).to.be.true;
            expect(parser.isFilenamePublic("main.ts")).to.be.true;
            expect(parser.isFilenamePublic("module.mjs")).to.be.true;
        });

        it("recognizes relative/absolute paths", () => {
            expect(parser.isFilenamePublic("./src/index.ts")).to.be.true;
            expect(parser.isFilenamePublic("/usr/bin/test.js")).to.be.true;
            expect(parser.isFilenamePublic(".")).to.be.true;
        });

        it("returns false for non-filenames", () => {
            expect(parser.isFilenamePublic("npm")).to.be.false;
            expect(parser.isFilenamePublic("start")).to.be.false;
        });
    });

    describe("hasExtension()", () => {
        const parser = new TestableCommandParser("echo");

        it("detects JS/TS extensions", () => {
            expect(parser.hasExtensionPublic("test.js")).to.be.true;
            expect(parser.hasExtensionPublic("test.ts")).to.be.true;
            expect(parser.hasExtensionPublic("test.cjs")).to.be.true;
        });

        it("returns false when no recognized extension", () => {
            expect(parser.hasExtensionPublic("command")).to.be.false;
            expect(parser.hasExtensionPublic("file.txt")).to.be.false;
        });
    });
});
