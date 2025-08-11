import BadRequestException from "@/domain/error/BadRequestException";
import checkExceptionCalledAsync from "../helpers/checkExceptionCalledAsync";
import { expect } from "chai";
import sinon from "sinon";

describe("checkExceptionCalledAsync", () => {
    it("should pass when spy is called with matching exception", async () => {
        const spy = sinon.spy(() =>
            Promise.reject(new BadRequestException("Bad user id"))
        );

        try {
            await spy();
        } catch {}

        expect(
            await checkExceptionCalledAsync(spy, BadRequestException, {
                message: "Bad user id",
            })
        ).to.be.true;
    });

    it("should fail when spy is not called with expected exception", async () => {
        const spy = sinon.spy();
        spy(new Error("Other"));

        expect(
            await checkExceptionCalledAsync(spy, BadRequestException, {
                message: "Bad user id",
            })
        ).to.be.false;
    });
});
