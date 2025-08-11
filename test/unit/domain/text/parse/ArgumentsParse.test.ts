import ArgumentsParse from "@/domain/text/parse/ArgumentsParse";
import BadRequestException from "@/domain/error/BadRequestException";
import { expect } from "chai";

describe("ArgumentsParse", () => {
    it("should throw on empty input", () => {
        expect(() => new ArgumentsParse([]).parse()).to.throw(
            BadRequestException,
            "Empty arguments"
        );
    });

    it("should throw on invalid input (non-string)", () => {
        const args = ["--foo", 123 as any, "--bar"];
        expect(() => new ArgumentsParse(args).parse()).to.throw(
            BadRequestException,
            "List argument is not an string or invalid"
        );
    });

    it("should parse single boolean flag", () => {
        const parsed = new ArgumentsParse(["--verbose"]).parse();
        expect(parsed).to.deep.equal({ verbose: true });
    });

    it("should parse flag with string value", () => {
        const parsed = new ArgumentsParse(["--name", "marcelo"]).parse();
        expect(parsed).to.deep.equal({ name: "marcelo" });
    });

    it("should parse flag with numeric integer value", () => {
        const parsed = new ArgumentsParse(["--age", "30"]).parse();
        expect(parsed).to.deep.equal({ age: 30 });
    });

    it("should parse flag with float value", () => {
        const parsed = new ArgumentsParse(["--price", "3.14"]).parse();
        expect(parsed).to.deep.equal({ price: 3.14 });
    });

    it("should parse boolean string values correctly", () => {
        const parsed = new ArgumentsParse([
            "--isAdmin",
            "true",
            "--isActive",
            "false",
        ]).parse();
        expect(parsed).to.deep.equal({ isAdmin: true, isActive: false });
    });

    it("should parse duplicated flags as array", () => {
        const parsed = new ArgumentsParse([
            "--tag",
            "a",
            "--tag",
            "b",
            "--tag",
            "c",
        ]).parse();
        expect(parsed).to.deep.equal({ tag: ["a", "b", "c"] });
    });

    it("should skip non-flag values", () => {
        const parsed = new ArgumentsParse([
            "node",
            "index.js",
            "--port",
            "8080",
        ]).parse();
        expect(parsed).to.deep.equal({ port: 8080 });
    });

    it("should handle flags with hyphen prefix (-x)", () => {
        const parsed = new ArgumentsParse(["-x", "1"]).parse();
        expect(parsed).to.deep.equal({ x: 1 });
    });

    it("should handle no value after flag (defaults to true)", () => {
        const parsed = new ArgumentsParse(["--debug", "--name", "dev"]).parse();
        expect(parsed).to.deep.equal({ debug: true, name: "dev" });
    });

    it("should parse scientific notation as float", () => {
        const parsed = new ArgumentsParse(["--value", "1.2e3"]).parse();
        expect(parsed).to.deep.equal({ value: 1200 });
    });
});

describe("transformValueFromString()", () => {
    const parser = new ArgumentsParse([]);

    it("should return true for string 'true'", () => {
        expect(parser.transformValueFromString("true")).to.equal(true);
    });

    it("should return false for string 'false'", () => {
        expect(parser.transformValueFromString("false")).to.equal(false);
    });

    it("should return boolean true if already boolean", () => {
        expect(parser.transformValueFromString(true)).to.equal(true);
    });

    it("should return boolean false if already boolean", () => {
        expect(parser.transformValueFromString(false)).to.equal(false);
    });

    it("should return integer for integer string", () => {
        expect(parser.transformValueFromString("42")).to.equal(42);
    });

    it("should return negative integer", () => {
        expect(parser.transformValueFromString("-99")).to.equal(-99);
    });

    it("should return float for float string", () => {
        expect(parser.transformValueFromString("3.1415")).to.equal(3.1415);
    });

    it("should return negative float", () => {
        expect(parser.transformValueFromString("-2.5")).to.equal(-2.5);
    });

    it("should return float in scientific notation", () => {
        expect(parser.transformValueFromString("1.23e4")).to.equal(12300);
    });

    it("should return original string if not number or boolean", () => {
        expect(parser.transformValueFromString("hello")).to.equal("hello");
    });

    it("should return original string with invalid number format", () => {
        expect(parser.transformValueFromString("12abc")).to.equal("12abc");
    });
});
