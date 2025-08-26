import { expect } from "chai";

export const expectThrowsAsync = async (
    method,
    errorClass: new (...args: any[]) => Error,
    expectedData?: unknown
) => {
    let error = null;
    try {
        await method();
    } catch (err) {
        error = err;
    }
    expect(error).to.be.an("Error");
    if (error) {
        expect(error).to.be.an.instanceof(errorClass);
        if (expectedData) {
            if (typeof expectedData === "string") {
                expect(error.message).to.equal(expectedData);
            } else {
                expect(error).to.equal(expectedData);
            }
        }
    }
};
