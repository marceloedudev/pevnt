import { FileImport } from "@/domain/entity/FileImport";
import { expect } from "chai";

describe("FileImport", () => {
    describe("normalize()", () => {
        it("should replace ./src/ with @/", () => {
            const file = new FileImport("./src/utils/helper.ts");
            expect(file.normalize()).to.equal("@/utils/helper.ts");
        });

        it("should not modify path if it does not start with ./src/", () => {
            const file = new FileImport("lib/utils.ts");
            expect(file.normalize()).to.equal("lib/utils.ts");
        });
    });

    describe("detectFileType()", () => {
        it("should detect typescript for .ts", () => {
            const file = new FileImport("main.ts");
            expect(file.detectFileType()).to.equal("typescript");
        });

        it("should detect typescript for .tsx", () => {
            const file = new FileImport("component.tsx");
            expect(file.detectFileType()).to.equal("typescript");
        });

        it("should detect javascript for .js", () => {
            const file = new FileImport("script.js");
            expect(file.detectFileType()).to.equal("javascript");
        });

        it("should detect javascript for .jsx", () => {
            const file = new FileImport("component.jsx");
            expect(file.detectFileType()).to.equal("javascript");
        });

        it("should detect esm for .mjs", () => {
            const file = new FileImport("module.mjs");
            expect(file.detectFileType()).to.equal("esm");
        });

        it("should detect commonjs for .cjs", () => {
            const file = new FileImport("legacy.cjs");
            expect(file.detectFileType()).to.equal("commonjs");
        });

        it("should detect unknown for unrecognized extensions", () => {
            const file = new FileImport("file.abc");
            expect(file.detectFileType()).to.equal("unknown");
        });

        it("should detect unknown when file has no extension", () => {
            const file = new FileImport("Makefile");
            expect(file.detectFileType()).to.equal("unknown");
        });

        it("should trim spaces around path before detecting extension", () => {
            const file = new FileImport("  module.tsx  ");
            expect(file.detectFileType()).to.equal("typescript");
        });
    });
});
