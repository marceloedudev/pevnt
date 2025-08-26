import {
    ErrorTransport,
    SerializedError,
} from "@/domain/entity/ErrorTransport";

import { expect } from "chai";

describe("ErrorTransport", () => {
    let transport: ErrorTransport;

    beforeEach(() => {
        transport = new ErrorTransport();
    });

    describe("serialize()", () => {
        it("should serialize error with stack including file/line/column", () => {
            const err = new Error("invalid user");

            err.stack = `Error: invalid user
    at Object.<anonymous> (/home/user/project/testFile.ts:10:15)
    at Module._compile (internal/modules/cjs/loader.js:1063:30)`;

            const result = transport.serialize(err);

            expect(result.message).to.equal("invalid user");
            expect(result.stack).to.include("Error: invalid user");
            expect(result.file).to.equal("/home/user/project/testFile.ts");
            expect(result.line).to.equal("10");
            expect(result.column).to.equal("15");
        });

        it("should handle error without stack", () => {
            const err = new Error("no stack");
            err.stack = undefined;

            const result = transport.serialize(err);

            expect(result.message).to.equal("no stack");
            expect(result.stack).to.equal("");
            expect(result.file).to.be.undefined;
            expect(result.line).to.be.undefined;
            expect(result.column).to.be.undefined;
        });

        it("should handle error with stack but no match for file/line/column", () => {
            const err = new Error("broken stack");
            err.stack = `Error: broken stack
    at <anonymous>:1:1`;

            const result = transport.serialize(err);

            expect(result.message).to.equal("broken stack");
            expect(result.file).to.be.undefined;
            expect(result.line).to.be.undefined;
            expect(result.column).to.be.undefined;
        });
    });

    describe("rebuild()", () => {
        it("should rebuild error with same message and stack", () => {
            const serialized: SerializedError = {
                message: "rebuilt error",
                stack: "Error: rebuilt error\n    at fake.ts:1:1",
                file: "fake.ts",
                line: "1",
                column: "1",
            };

            const err = transport.rebuild(serialized);

            expect(err).to.be.instanceOf(Error);
            expect(err.message).to.equal("rebuilt error");
            expect(err.stack).to.equal(serialized.stack);
        });
    });
});
