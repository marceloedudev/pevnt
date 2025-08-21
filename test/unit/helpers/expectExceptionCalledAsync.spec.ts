import { checkExceptionCalledAsync } from "../../helpers/checkExceptionCalledAsync";
import { expect } from "chai";
import sinon from "sinon";

describe("checkExceptionCalledAsync", () => {
    it("should pass when spy is called with matching exception", async () => {
        const spy = sinon.spy(() => Promise.reject(new Error("Bad user id")));

        try {
            await spy();
        } catch {}

        expect(
            await checkExceptionCalledAsync(spy, Error, {
                message: "Bad user id",
            })
        ).to.be.true;
    });

    it("should fail when spy is not called with expected exception", async () => {
        const spy = sinon.spy(() => Promise.reject(new Error("error")));

        try {
            await spy();
        } catch {}

        expect(
            await checkExceptionCalledAsync(spy, Error, {
                message: "Bad user id",
            })
        ).to.be.false;
    });

    it("should pass when spy is called with class and expected data undefined", async () => {
        const spy = sinon.spy(() => Promise.reject(new Error("Bad user id")));

        try {
            await spy();
        } catch {}

        expect(await checkExceptionCalledAsync(spy, Error)).to.be.true;
    });
});
