import path from "node:path";

export type FileType =
    | "typescript"
    | "javascript"
    | "esm"
    | "commonjs"
    | "unknown";

export function DetectFileType(filePath: string): FileType {
    const extension = path.extname(filePath?.trim?.()).toLowerCase();

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
