import { ParserFactory } from "@/infra/acmdp/ParserFactory";
import { TransportType } from "@/shared/enums/TransportType";
import { expect } from "chai";
import { getCommandCLI } from "../helpers/GetCommandCLI";
import path from "node:path";
import { runCommandSpawn } from "../helpers/RunCommandSpawn";

const runUserConsumerE2E = async (
    transport: TransportType,
    userId: number[]
) => {
    const file = path.resolve("./test/e2e/fixture/runners/user-cli.ts");
    const { command, execArgv, filename } = getCommandCLI({ file });

    const argv = new ParserFactory().createArgumentsParser().unparse({
        userId,
        transport,
    });

    return await runCommandSpawn(command, [...execArgv, filename, ...argv]);
};

Object.values(TransportType).forEach((transport: TransportType) => {
    describe(`UserConsumer E2E CLI using spawn + close event (${transport.toLowerCase()})`, () => {
        it("should run successfully and exit with code 0", async () => {
            const { code, stdout, stderr } = await runUserConsumerE2E(
                transport,
                [100, 200, 300]
            );

            expect(code).to.equal(0);
            expect(stderr).to.equal("");
            expect(stdout).to.include(
                "UserConsumerBegin",
                "UserConsumerCompleted"
            );
        });

        it("should fail with exit throw error duplicate user id", async () => {
            const { code, stdout, stderr } = await runUserConsumerE2E(
                transport,
                [255, 255]
            );

            expect(code).to.equal(0);
            expect(stderr).to.include("This user id already exists");
            expect(stdout).to.include("UserConsumerBegin", "{ user_id: 103 }");
        });

        it("should fail with exit throw error bad user id", async () => {
            const { code, stdout, stderr } = await runUserConsumerE2E(
                transport,
                [333, 12]
            );

            expect(code).to.equal(0);
            expect(stderr).to.include("Bad user id");
            expect(stderr).to.include("at Object.onMessage");
        });
    });
});
