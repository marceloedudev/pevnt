import { CommandRunner } from "@/infra/command/CommandRunner";
import { Delay } from "@/shared/utils/Delay";
import { EnvConfig } from "../../../helpers/EnvConfig";

export async function main() {
    await CommandRunner(async ({ params, sendEventAndReturn }) => {
        async function start({ itemId: item_id = 0 }) {
            await sendEventAndReturn({
                data: { item_id },
            });
            await Delay(5000);
        }

        await start(params as any);
    });
}

if (new EnvConfig().isTest() === false) {
    main();
}
