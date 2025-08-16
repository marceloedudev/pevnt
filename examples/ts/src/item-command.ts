import { CommandRunner } from "../../../dist";
import { Delay } from "./Delay";

export async function main() {
    await CommandRunner(async ({ params, sendEventAndReturn }) => {
        async function start({ itemid: item_id = 0 }) {
            const res = await sendEventAndReturn({
                data: { item_id },
            });
            console.log("item-command.ts >> ", { res });
            await Delay(5000);
        }

        await start(params);
    });
}

main();
