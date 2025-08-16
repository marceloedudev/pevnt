import "../helpers/fakeDatabase";

import { BadRequestException } from "./fixture/error/BadRequestException";
import { NotFoundException } from "./fixture/error/NotFoundException";
import { UserConsumer } from "./fixture/consumer/UserConsumer/UserConsumer";
import { UserConsumerBegin } from "./fixture/consumer/UserConsumer/steps/UserConsumerBegin";
import { UserConsumerCompleted } from "./fixture/consumer/UserConsumer/steps/UserConsumerCompleted";
import { UserConsumerFailed } from "./fixture/consumer/UserConsumer/steps/UserConsumerFailed";
import { checkExceptionCalledAsync } from "../helpers/checkExceptionCalledAsync";
import { expect } from "chai";
import sinon from "sinon";

describe("UserConsumer E2E Memory", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("should run a full E2E flow with multiple user consumers and steps", async () => {
        const spyBegin = sinon.spy(UserConsumerBegin.prototype, "onMessage");
        const spyCompleted = sinon.spy(
            UserConsumerCompleted.prototype,
            "onMessage"
        );

        const consumer = new UserConsumer();

        const myConsumers = [];

        myConsumers.push(
            await consumer.create({
                params: {
                    userId: 100,
                },
            })
        );

        myConsumers.push(
            await consumer.create({
                params: {
                    userId: 200,
                },
            })
        );

        myConsumers.push(
            await consumer.create({
                params: {
                    userId: 300,
                },
            })
        );

        expect(consumer.getConsumer().listConsumers().length).to.be.equal(3);

        expect(myConsumers).to.deep.equal([{ id: 1 }, { id: 2 }, { id: 3 }]);

        expect(spyBegin.callCount).to.equal(3);

        expect(spyBegin.firstCall.args[0]).to.deep.equal({
            data: { user_id: 100 },
        });
        expect(spyBegin.secondCall.args[0]).to.deep.equal({
            data: { user_id: 200 },
        });
        expect(spyBegin.thirdCall.args[0]).to.deep.equal({
            data: { user_id: 300 },
        });

        expect(spyCompleted.firstCall.args[0]).to.deep.equal({
            data: { user_id: 100, url: `string;;${100}` },
        });
        expect(spyCompleted.secondCall.args[0]).to.deep.equal({
            data: { user_id: 200, url: `string;;${200}` },
        });
        expect(spyCompleted.thirdCall.args[0]).to.deep.equal({
            data: { user_id: 300, url: `string;;${300}` },
        });

        for (const { id } of myConsumers) {
            await consumer.getConsumer().stop(id);
        }

        expect(consumer.getConsumer().listConsumers().length).to.be.equal(0);

        spyBegin.restore();
        spyCompleted.restore();
    });

    it("should run a full E2E flow with user consumer and throw exception", async () => {
        const spyBegin = sinon.spy(UserConsumerBegin.prototype, "onMessage");
        const spyFailed = sinon.spy(UserConsumerFailed.prototype, "onMessage");

        const consumer = new UserConsumer();

        const { id } = await consumer.create({
            params: {
                userId: 11,
            },
        });

        expect(spyBegin.calledOnce).to.be.true;

        expect(
            await checkExceptionCalledAsync(
                spyBegin,
                BadRequestException,
                "Bad user id"
            )
        ).to.be.true;

        expect(spyFailed.calledOnce).to.be.true;
        expect(spyFailed.firstCall.args[0]).to.deep.equal({
            data: { user_id: 11 },
        });

        await consumer.getConsumer().stop(id);

        expect(consumer.getConsumer().listConsumers().length).to.be.equal(0);

        spyBegin.restore();
        spyFailed.restore();
    });

    it("should run a full E2E flow with user consumer and throw exception invalid user id", async () => {
        const spyBegin = sinon.spy(UserConsumerBegin.prototype, "onMessage");
        const spyFailed = sinon.spy(UserConsumerFailed.prototype, "onMessage");

        const consumer = new UserConsumer();

        const { id } = await consumer.create({
            params: {
                userId: 0,
            },
        });

        expect(spyBegin.calledOnce).to.be.true;

        expect(
            await checkExceptionCalledAsync(
                spyBegin,
                NotFoundException,
                "Invalid user id"
            )
        ).to.be.true;

        expect(spyFailed.calledOnce).to.be.true;
        expect(spyFailed.firstCall.args[0]).to.deep.equal({
            data: { user_id: 0 },
        });

        await consumer.getConsumer().stop(id);

        expect(consumer.getConsumer().listConsumers().length).to.be.equal(0);

        spyBegin.restore();
        spyFailed.restore();
    });
});
