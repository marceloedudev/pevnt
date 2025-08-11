import { Command } from "@/infra/eventbus/Command";
import Delay from "@/domain/timers/Delay";

export async function main() {
    await Command(async ({ params, sendEventAndReturn, runWithLoop }) => {
        async function start({ itemid: item_id = 0 }) {
            runWithLoop(async () => {
                const res = await sendEventAndReturn({
                    data: { item_id },
                });
                console.log("item-command.ts >> ", { res });
                await Delay(5000);
            });
        }

        await start(params as any);
    });
}

if (process.env.NODE_ENV !== "test") {
    main();
}
