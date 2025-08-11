import "../helpers/fakeDatabase";

import Delay from "@/domain/timers/Delay";
import ItemConsumer from "@/infra/event/consumer/ItemConsumer";
import { expect } from "chai";
import sinon from "sinon";

describe("ItemConsumer Memory E2E", () => {
    afterEach(() => {
        sinon.restore();
    });

    it("should run a full E2E flow with multiple item consumers and steps", async () => {
        const consumer = new ItemConsumer();

        const stubGetConsumers = sinon.stub(consumer, "getConsumers");

        (consumer as any).__innerSpies = [];

        stubGetConsumers.callsFake((): any => {
            const originalFn = sinon.spy(new ItemConsumer().getConsumers());
            (consumer as any).__innerSpies.push(originalFn);
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

        await Delay(5000);

        const innerSpies = (consumer as any).__innerSpies;
        expect(innerSpies.length).to.equal(2);

        expect(innerSpies[0].calledOnce).to.be.true;
        expect(innerSpies[0].getCall(0).args[0]).to.deep.equal({
            data: { item_id: 100 },
        });

        expect(innerSpies[1].calledOnce).to.be.true;
        expect(innerSpies[1].getCall(0).args[0]).to.deep.equal({
            data: { item_id: 200 },
        });

        expect(myConsumers).to.deep.equal([{ id: 1 }, { id: 2 }]);

        for (const { id } of myConsumers) {
            await consumer.stop(id);
        }

        expect(consumer.listWorkers().length).to.be.equal(0);

        stubGetConsumers.restore();
    });
});
