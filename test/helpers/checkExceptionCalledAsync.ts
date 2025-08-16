import { matchDeepValue } from "./matchDeepValue";

export async function checkExceptionCalledAsync(
    spy: sinon.SinonSpy,
    errorClass: new (...args: any[]) => Error,
    expectedData?: unknown
) {
    const calls = spy.getCalls();

    const results = await Promise.all(
        calls.map(async (call) => {
            const ret = call.returnValue;
            if (ret && typeof ret.catch === "function") {
                try {
                    await ret;
                    return false;
                } catch (err: any) {
                    if (
                        err instanceof errorClass &&
                        expectedData === undefined
                    ) {
                        return true;
                    }

                    const errMsg =
                        typeof err?.message === "string" ? err.message : "";

                    if (typeof expectedData === "string") {
                        return errMsg === expectedData;
                    }

                    if (expectedData instanceof RegExp) {
                        return expectedData.test(errMsg);
                    }

                    if (typeof expectedData === "function") {
                        return expectedData(err);
                    }

                    if (
                        typeof expectedData === "object" &&
                        expectedData !== null
                    ) {
                        return Object.entries(expectedData).every(
                            ([key, value]) => {
                                return matchDeepValue(err?.[key], value);
                            }
                        );
                    }

                    return false;
                }
            }
            return false;
        })
    );

    const found = results.some(Boolean);
    return found;
}
