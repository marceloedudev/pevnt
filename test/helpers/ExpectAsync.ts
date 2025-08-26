import { expect } from "chai";

export async function expectAsync<T>(
    method: () => Promise<T>,
    expectedData?: unknown
): Promise<void> {
    try {
        const response = await method();
        if (typeof expectedData === "string") {
            expect(response).to.equal(expectedData);
        } else if (Array.isArray(response)) {
            expect(response).to.deep.equal(expectedData);
        } else if (expectedData instanceof RegExp) {
            expect(response).to.match(expectedData);
        } else if (typeof expectedData === "object") {
            expect(response).to.deep.equal(expectedData);
        } else {
            expect(response).to.equal(expectedData);
        }
    } catch (err: any) {
        expect.fail(err?.message || err);
    }
}
