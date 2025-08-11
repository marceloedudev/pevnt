import { Command } from "@/infra/eventbus/Command";
import Delay from "@/domain/timers/Delay";

export async function main() {
    await Command(async ({ params, sendEventAndReturn, runWithLoop }) => {
        async function start() {
            // runWithLoop(async () => {
            const res = await sendEventAndReturn(undefined);
            console.log("call-command.ts >> ", { res });
            await Delay(6000);
            // });
        }

        await start();
    });
}

if (process.env.NODE_ENV !== "test") {
    main();
}
