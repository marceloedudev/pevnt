import "../../helpers/fakeDatabase";

import { Delay } from "@/shared/utils/Delay";
import { ITransportType } from "@/index";
import { ItemConsumer } from "../fixture/consumer/ItemConsumer";
import { MessageConsumerBase } from "@/infra/eventbus/MessageConsumerBase";
import { expect } from "chai";
import sinon from "sinon";

describe("ItemConsumer E2E Memory", () => {
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it("should run a full E2E flow with multiple item consumers and steps", async () => {
        const spyCreateConsumer = sandbox.spy(
            MessageConsumerBase.prototype,
            "create"
        );

        const consumer = new ItemConsumer();

        const GetConsumerClass = consumer.getConsumer();

        const mySpies = [];

        sandbox.stub(GetConsumerClass, "getHooks").callsFake((): any => {
            const originalFn = sandbox.spy(
                new ItemConsumer().getConsumer().getHooks()
            );
            mySpies.push(originalFn);
            return originalFn;
        });

        const myConsumers = [];

        myConsumers.push(
            await consumer.create({
                params: {
                    itemId: 100,
                },
            })
        );

        myConsumers.push(
            await consumer.create({
                params: {
                    itemId: 200,
                },
            })
        );

        await Delay(1000);

        expect(mySpies.length).to.equal(2);

        expect(mySpies[0].calledOnce).to.be.true;
        expect(mySpies[0].getCall(0).args[0]).to.deep.equal({
            data: { item_id: 100 },
        });

        expect(mySpies[1].calledOnce).to.be.true;
        expect(mySpies[1].getCall(0).args[0]).to.deep.equal({
            data: { item_id: 200 },
        });

        expect(consumer.getConsumer().listConsumers().length).to.be.equal(2);

        expect(spyCreateConsumer.callCount).to.be.equal(2);

        expect(spyCreateConsumer.getCall(0).args[0]).to.deep.equal({
            params: { itemId: 100 },
        });

        expect(spyCreateConsumer.getCall(1).args[0]).to.deep.equal({
            params: { itemId: 200 },
        });

        expect(myConsumers).to.deep.equal([{ id: 1 }, { id: 2 }]);

        for (const { id } of myConsumers) {
            await consumer.getConsumer().stop(id);
        }

        expect(consumer.getConsumer().listConsumers().length).to.be.equal(0);

        spyCreateConsumer.restore();
    });

    it("should run a full E2E flow with item consumer and invalid filename (command file)", async () => {
        async function addConsumer() {
            const itemConsumer = new MessageConsumerBase()
                .transport(ITransportType.WORKER)
                .filename("./src/item-command.json")
                .consumers(async ({ data }) => {
                    return { itemId: data.item_id };
                });
            await itemConsumer.create({
                params: { itemId: 10 },
            });
        }
        try {
            await addConsumer();
            expect.fail("Expected promise to reject.");
        } catch (error) {
            expect(error.message).to.equal("Invalid type file");
        }
    });
});
