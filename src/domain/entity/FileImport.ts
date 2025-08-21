import path from "node:path";

export type FileType =
    | "typescript"
    | "javascript"
    | "esm"
    | "commonjs"
    | "unknown";

export class FileImport {
    constructor(private readonly path: string) {}

    public normalize(): string {
        return this.path.replace(/^\.\/src\//, "@/");
    }

    public detectFileType(): string {
        const extension = path.extname(this.path?.trim?.()).toLowerCase();

        switch (extension) {
            case ".ts":
            case ".tsx":
                return "typescript";
            case ".js":
            case ".jsx":
                return "javascript";
            case ".mjs":
                return "esm";
            case ".cjs":
                return "commonjs";
            default:
                return "unknown";
        }
    }
}
