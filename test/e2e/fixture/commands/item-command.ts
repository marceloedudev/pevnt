import { CommandRunner } from "@/index";
import { Delay } from "@/shared/utils/Delay";

export async function main() {
    await CommandRunner(async ({ params, sendEventAndReturn }) => {
        async function start({ itemId: item_id = 0 }) {
            const res = await sendEventAndReturn({
                data: { item_id },
            });
            console.log("item-command.ts >> ", { res });
            await Delay(5000);
        }

        await start(params as any);
    });
}

if (process.env.NODE_ENV !== "test") {
    main();
}
