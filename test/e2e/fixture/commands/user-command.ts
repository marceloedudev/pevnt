import { CommandRunner } from "@/infra/command/CommandRunner";
import { Delay } from "@/shared/utils/Delay";

export async function main() {
    await CommandRunner(async ({ params, sendEventAndReturn }) => {
        async function start({ userId: user_id = 0 }) {
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
                console.error({ error });
                await sendEventAndReturn(
                    {
                        data: {
                            user_id,
                        },
                    },
                    "failed"
                );
            } finally {
                await Delay(5000);
            }
        }

        await start(params as any);
    });
}

main();
