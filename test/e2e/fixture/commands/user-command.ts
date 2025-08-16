import { CommandRunner } from "@/index";
import { Delay } from "@/shared/utils/Delay";
import { RandomNumber } from "@/domain/numbers/Random";

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
                const timesecs = new RandomNumber().randomInRange(5, 10);
                await Delay(timesecs * 1000);
            }
        }

        await start(params as any);
    });
}

if (process.env.NODE_ENV !== "test") {
    main();
}
