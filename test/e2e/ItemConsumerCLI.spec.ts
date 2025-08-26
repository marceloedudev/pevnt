import { ParserFactory } from "@/infra/acmdp/ParserFactory";
import { TransportType } from "@/shared/enums/TransportType";
import { expect } from "chai";
import { getCommandCLI } from "../helpers/GetCommandCLI";
import path from "node:path";
import { runCommandSpawn } from "../helpers/RunCommandSpawn";

const runItemConsumerE2E = async (
    transport: TransportType,
    itemId: number[]
) => {
    const file = path.resolve("./test/e2e/fixture/runners/item-cli.ts");
    const { command, execArgv, filename } = getCommandCLI({ file });

    const argv = new ParserFactory().createArgumentsParser().unparse({
        itemId,
        transport,
    });

    return await runCommandSpawn(command, [...execArgv, filename, ...argv]);
};

Object.values(TransportType).forEach((transport: TransportType) => {
    describe(`ItemConsumer E2E CLI using spawn + close event (${transport.toLowerCase()})`, () => {
        it("should run successfully add/remove all and exit with code 0", async () => {
            const { code, stdout, stderr } = await runItemConsumerE2E(
                transport,
                [333, 666]
            );

            expect(code).to.equal(0);
            expect(stderr).to.equal("");
            expect(stdout).to.include("{ empty: [] }");
            expect(stdout).to.include("{ total: [ 3, 4 ] }");
            expect(stdout).to.include(
                "CommandRunner (Item): { data: { itemId: 333 } }"
            );
            expect(stdout).to.include(
                "CommandRunner (Item): { data: { itemId: 666 } }"
            );
            expect(stdout).to.include(
                "ItemConsumer: { data: { item_id: 333 } }"
            );
            expect(stdout).to.include(
                "ItemConsumer: { data: { item_id: 666 } }"
            );
        });
    });
});
