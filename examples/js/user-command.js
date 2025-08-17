import { CommandRunner } from "pevnt";
import { Delay } from "./Delay.mjs";

export async function main() {
    await CommandRunner(async ({ params, sendEventAndReturn }) => {
        async function start({ userid: user_id = 0 }) {
            try {
                const { url } = await sendEventAndReturn(
                    {
                        data: { user_id },
                    },
                    "begin"
                );
                console.log({ url });
                //
                // code...
                //
                await sendEventAndReturn(
                    {
                        data: {
                            user_id,
                            url,
                        },
                    },
                    "completed"
                );
            } catch (error) {
                await sendEventAndReturn(
                    {
                        data: {
                            user_id,
                        },
                    },
                    "failed"
                );
            } finally {
                await Delay(3000);
            }
        }

        await start(params);
    });
}

if (process.env.NODE_ENV !== "test") {
    main();
}
