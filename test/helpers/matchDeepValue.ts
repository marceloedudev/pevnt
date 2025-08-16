export function matchDeepValue(actualValue: any, expectedValue: any): boolean {
    const isPrimitiveExpected =
        typeof expectedValue === "string" ||
        typeof expectedValue === "number" ||
        typeof expectedValue === "boolean";

    if (isPrimitiveExpected && Array.isArray(actualValue)) {
        return actualValue.some((element) =>
            matchDeepValue(element, expectedValue)
        );
    }

    if (Array.isArray(actualValue) && Array.isArray(expectedValue)) {
        if (actualValue.length !== expectedValue.length) {
            return false;
        }
        return expectedValue.every((expectedElement) =>
            actualValue.some((actualElement) =>
                matchDeepValue(actualElement, expectedElement)
            )
        );
    }

    const isObjectActual =
        actualValue &&
        typeof actualValue === "object" &&
        !Array.isArray(actualValue);
    const isObjectExpected =
        expectedValue &&
        typeof expectedValue === "object" &&
        !Array.isArray(expectedValue);

    if (isObjectActual && isObjectExpected) {
        return Object.keys(expectedValue).every((key) =>
            matchDeepValue(actualValue[key], expectedValue[key])
        );
    }

    return actualValue === expectedValue;
}
