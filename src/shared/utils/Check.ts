export function isFunction(value: unknown): value is Function {
    return typeof value === "function";
}

export function isClass(value: unknown): boolean {
    if (typeof value !== "function") {
        return false;
    }
    const str = Function.prototype.toString.call(value);
    return /^class\s/.test(str);
}
