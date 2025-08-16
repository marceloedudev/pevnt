import { CommandRunner } from "@/index";
import { Delay } from "@/shared/utils/Delay";

export async function main() {
    await CommandRunner(async ({ params, sendEventAndReturn }) => {
        async function start() {
            const res = await sendEventAndReturn(undefined);
            console.log("call-command.ts >> ", { res });
            await Delay(6000);
        }

        await start();
    });
}

if (process.env.NODE_ENV !== "test") {
    main();
}
