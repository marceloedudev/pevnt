import { expect } from "chai";
import { getCommandCLI } from "../helpers/getCommandCLI";
import path from "path";
import { runCommandSpawn } from "../helpers/runCommandSpawn";

describe("ItemConsumer E2E CLI using spawn + close event", () => {
    it("should run successfully and exit with code 0", async () => {
        const file = path.resolve("./test/e2e/fixture/cli/RunItem.ts");

        const { command, execArgv, filename } = getCommandCLI({ file });

        const { code, stdout, stderr } = await runCommandSpawn(`${command}`, [
            ...execArgv,
            filename,
        ]);

        expect(code).to.equal(0);
        expect(stderr).to.equal("");
        expect(stdout).to.include("{ first: [ 1 ] }");
        expect(stdout).to.include("{ itemList: [] }");
        expect(stdout).to.include(
            "{ data: { item_id: 666 }",
            "{ res: { itemId: 666 } }"
        );
        expect(stdout).to.include("{ itemListFinal: [ 2 ] }");
    });
});
