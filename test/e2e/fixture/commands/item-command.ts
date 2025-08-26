import { CommandRunner } from "@/infra/command/CommandRunner";
import { Delay } from "@/shared/utils/Delay";

export async function main() {
    await CommandRunner(async ({ params, sendEventAndReturn }) => {
        async function start({ itemId: item_id = 0 }) {
            const data = await sendEventAndReturn({
                data: { item_id },
            });
            console.log("CommandRunner (Item):", { data });
            await Delay(5000);
        }

        await start(params as any);
    });
}

main();
