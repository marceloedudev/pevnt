import { expect } from "chai";
import { matchDeepValue } from "../../helpers/MatchDeepValue";

describe("matchDeepValue", () => {
    it("should not match subset in array", () => {
        expect(matchDeepValue(["Bob", "Ana"], ["Ana"])).to.be.false;
    });

    it("should match string subset in array", () => {
        expect(matchDeepValue(["Bob", "Ana"], "Ana")).to.be.true;
    });

    it("should not match subset in object with array", () => {
        expect(
            matchDeepValue(
                { users: [{ name: "Ana" }, { name: "Bob" }] },
                { users: [{ name: "Bob" }] }
            )
        ).to.be.false;
    });

    it("should return true for same list in different order", () => {
        expect(
            matchDeepValue(
                { users: [{ name: "Ana" }, { name: "Bob" }] },
                { users: [{ name: "Bob" }, { name: "Ana" }] }
            )
        ).to.be.true;
    });

    it("should return false for different structure", () => {
        expect(
            matchDeepValue(
                { users: [{ name: "Ana" }, { name: "Bob" }] },
                { name: "Bob" }
            )
        ).to.be.false;
    });
});
