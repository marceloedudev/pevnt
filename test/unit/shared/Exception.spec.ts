import { Exception } from "@/shared/errors/Exception";
import { expect } from "chai";

describe("Exception", () => {
    it("should store the message passed in constructor", () => {
        const err = new Exception("Something went wrong");
        expect(err.message).to.equal("Something went wrong");
    });

    it("should set a timestamp automatically if not provided", () => {
        const before = new Date();
        const err = new Exception("Auto timestamp");
        const after = new Date();

        expect(err.timestamp).to.be.instanceOf(Date);
        expect(err.timestamp.getTime()).to.be.greaterThanOrEqual(
            before.getTime()
        );
        expect(err.timestamp.getTime()).to.be.lessThanOrEqual(after.getTime());
    });

    it("should use the provided timestamp if given", () => {
        const customDate = new Date("2023-01-01T00:00:00Z");
        const err = new Exception("Custom timestamp", customDate);

        expect(err.timestamp).to.equal(customDate);
    });

    it("should inherit from Error", () => {
        const err = new Exception("Inheritance test");
        expect(err).to.be.instanceOf(Error);
        expect(err).to.be.instanceOf(Exception);
    });

    it("should have correct name property", () => {
        const err = new Exception("Check name");
        expect(err.name).to.equal("Error");
        expect(err.message).to.equal("Check name");
    });
});
