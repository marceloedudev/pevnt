import { expect } from "chai";
import { getCommandCLI } from "../../helpers/getCommandCLI";
import path from "path";
import { runCommandSpawn } from "../../helpers/runCommandSpawn";

describe("UserConsumer E2E CLI using spawn + close event", () => {
    it("should run successfully and exit with code 0", async () => {
        const file = path.resolve("./test/e2e/fixture/runners/RunUser.ts");

        const { command, execArgv, filename } = getCommandCLI({ file });

        const { code, stdout, stderr } = await runCommandSpawn(`${command}`, [
            ...execArgv,
            filename,
        ]);

        expect(code).to.equal(0);
        expect(stderr).to.equal("");
        expect(stdout).to.include("UserConsumerBegin", "UserConsumerCompleted");
    });

    it("should fail with exit throw error duplicate user id", async () => {
        const file = path.resolve(
            "./test/e2e/fixture/runners/RunUserDuplicate.ts"
        );

        const { command, execArgv, filename } = getCommandCLI({ file });

        const { code, stdout, stderr } = await runCommandSpawn(`${command}`, [
            ...execArgv,
            filename,
        ]);

        expect(code).to.equal(0);
        expect(stderr).to.include("This user id already exists");
        expect(stdout).to.include("UserConsumerBegin", "{ user_id: 103 }");
    });
});
