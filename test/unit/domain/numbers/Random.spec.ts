import RandomNumber from "@/domain/numbers/Random";
import { expect } from "chai";

describe("RandomNumber", () => {
    const rng = new RandomNumber();

    it("should return a number between min and max", () => {
        for (let i = 0; i < 100; i++) {
            const result = rng.randomInRange(1, 5);
            expect(result).to.be.at.least(1);
            expect(result).to.be.below(5);
        }
    });

    it("should return a number with 2 decimal places", () => {
        const result = rng.randomInRange(10, 20);
        const decimal = result.toString().split(".")[1] || "";
        expect(decimal.length).to.be.at.most(2);
    });

    it("should return same number when min and max are equal", () => {
        const result = rng.randomInRange(3, 3);
        expect(result).to.equal(3);
    });

    it("should work with negative numbers", () => {
        for (let i = 0; i < 100; i++) {
            const result = rng.randomInRange(-10, -5);
            expect(result).to.be.at.least(-10);
            expect(result).to.be.below(-5);
        }
    });

    it("should work when min > max by swapping", () => {
        for (let i = 0; i < 100; i++) {
            const result = rng.randomInRange(5, 1);
            expect(result).to.be.at.least(1);
            expect(result).to.be.below(5);
        }
    });
});
