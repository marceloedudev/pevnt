// import { CommandRunner } from "pevnt";
import { CommandRunner } from "../../dist/index.js";
import { Delay } from "./Delay.mjs";

export async function main() {
    await CommandRunner(async ({ params, sendEventAndReturn }) => {
        async function start({ itemId: item_id = 0 }) {
            const res = await sendEventAndReturn({
                data: { item_id },
            });
            console.log("item-command.js >> ", { res });
            await Delay(5000);
        }

        await start(params);
    });
}

if (process.env.NODE_ENV !== "test") {
    main();
}
