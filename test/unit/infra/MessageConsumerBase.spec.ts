import { Exception } from "@/shared/errors/Exception";
import { IMessageConsumerBase } from "@/shared/interfaces/IMessageConsumerBase";
import { MessageConsumerBase } from "@/infra/eventbus/MessageConsumerBase";
import { OnCreateConsumer } from "@/infra/eventbus/base/OnCreateConsumer";
import { TransportType } from "@/shared/enums/TransportType";
import { expect } from "chai";
import { expectAsync } from "../../helpers/ExpectAsync";
import { expectThrowsAsync } from "../../helpers/ExpectThrowsAsync";
import sinon from "sinon";

describe("MessageConsumerBase Unit Test", () => {
    let consumer: MessageConsumerBase;

    beforeEach(() => {
        consumer = new MessageConsumerBase();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("create()", () => {
        it("should throw when filename is not defined", async () => {
            await expectThrowsAsync(
                () => consumer.create(),
                Exception,
                "Invalid filename"
            );
        });

        it("should throw when transport is missing", async () => {
            Object.defineProperty(consumer, "_filename", {
                value: "newname",
                writable: true,
            });

            await expectThrowsAsync(
                () => consumer.create(),
                Exception,
                "Transport required"
            );
        });

        it("should throw when transport is invalid", async () => {
            Object.defineProperty(consumer, "_filename", {
                value: "newname",
                writable: true,
            });
            sinon.stub(consumer, "getTransport").returns("WRONG!!" as any);

            await expectThrowsAsync(
                () => consumer.create(),
                Exception,
                "Invalid transport"
            );
        });

        it("should create consumer successfully with valid filename and transport", async () => {
            const createConsumer = sinon.stub(OnCreateConsumer.prototype);

            const myConsumer = {
                async register() {
                    return myConsumer;
                },
                async events() {
                    return myConsumer;
                },
                async stop() {},
                getPID() {
                    return "15874";
                },
            } as IMessageConsumerBase;

            createConsumer.execute.resolves(myConsumer);

            Object.defineProperty(consumer, "_filename", {
                value: "./main.ts",
                writable: true,
            });
            sinon.stub(consumer, "getTransport").returns(TransportType.PROCESS);

            await expectAsync(() => consumer.create(), { id: 1, pid: "15874" });
        });
    });

    describe("exists()", () => {
        it("should return false when consumer does not exist", () => {
            expect(consumer.exists(10)).to.false;
        });

        it("should return true when consumer exists", () => {
            Object.defineProperty(consumer, "_consumers", {
                value: { 2: {}, 4: {}, 8: {} },
                writable: true,
            });

            expect(consumer.exists(8)).to.true;
        });
    });

    describe("listConsumers()", () => {
        it("should return a list of all consumer IDs", () => {
            Object.defineProperty(consumer, "_consumers", {
                value: { 2: {}, 4: {}, 8: {} },
                writable: true,
            });

            expect(consumer.listConsumers()).to.deep.equal([2, 4, 8]);
        });
    });

    describe("stop()", () => {
        it("should stop and remove a consumer by ID", async () => {
            Object.defineProperty(consumer, "_consumers", {
                value: {
                    2: {},
                    4: { async stop() {} },
                    8: {},
                },
                writable: true,
            });

            await consumer.stop(4);

            expect(consumer.listConsumers()).to.deep.equal([2, 8]);
        });
    });

    describe("getFilename()", () => {
        it("should not return an incorrect filename", () => {
            consumer.filename("./main.ts");
            expect(consumer.getFilename()).to.not.equal("wrong");
        });

        it("should return the correct filename", () => {
            consumer.filename("./main.ts");
            expect(consumer.getFilename()).to.equal("./main.ts");
        });
    });

    describe("getTransport()", () => {
        it("should not return an incorrect transport type", () => {
            consumer.transport(TransportType.WORKER);
            expect(consumer.getTransport()).to.not.equal(TransportType.PROCESS);
        });

        it("should return the correct transport type", () => {
            consumer.transport(TransportType.WORKER);
            expect(consumer.getTransport()).to.equal(TransportType.WORKER);
        });
    });
});
