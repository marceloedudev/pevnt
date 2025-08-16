export function ReplaceSrcWithAlias(importPath: string): string {
    return importPath.replace(/^\.\/src\//, "@/");
}
