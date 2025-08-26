import { FileImport } from "@/domain/entity/FileImport";
import { expect } from "chai";

describe("FileImport", () => {
    describe("normalize()", () => {
        it("should replace ./src/ with @/", () => {
            const file = new FileImport("./src/utils/file.ts");
            expect(file.normalize()).to.equal("@/utils/file.ts");
        });

        it("should return the same path if no ./src/ prefix", () => {
            const file = new FileImport("lib/file.ts");
            expect(file.normalize()).to.equal("lib/file.ts");
        });

        it("should handle empty string path", () => {
            const file = new FileImport("");
            expect(file.normalize()).to.equal("");
        });
    });

    describe("detectFileType()", () => {
        it("should detect typescript for .ts extension", () => {
            const file = new FileImport("module.ts");
            expect(file.detectFileType()).to.equal("typescript");
        });

        it("should detect typescript for .tsx extension", () => {
            const file = new FileImport("component.tsx");
            expect(file.detectFileType()).to.equal("typescript");
        });

        it("should detect javascript for .js extension", () => {
            const file = new FileImport("index.js");
            expect(file.detectFileType()).to.equal("javascript");
        });

        it("should detect javascript for .jsx extension", () => {
            const file = new FileImport("component.jsx");
            expect(file.detectFileType()).to.equal("javascript");
        });

        it("should detect esm for .mjs extension", () => {
            const file = new FileImport("bundle.mjs");
            expect(file.detectFileType()).to.equal("esm");
        });

        it("should detect commonjs for .cjs extension", () => {
            const file = new FileImport("legacy.cjs");
            expect(file.detectFileType()).to.equal("commonjs");
        });

        it("should return unknown for no extension", () => {
            const file = new FileImport("README");
            expect(file.detectFileType()).to.equal("unknown");
        });

        it("should return unknown for unsupported extension", () => {
            const file = new FileImport("style.css");
            expect(file.detectFileType()).to.equal("unknown");
        });

        it("should trim path and detect extension", () => {
            const file = new FileImport("  extra.ts  ");
            expect(file.detectFileType()).to.equal("typescript");
        });
    });
});
