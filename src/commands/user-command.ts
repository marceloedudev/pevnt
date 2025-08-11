import { Command } from "@/infra/eventbus/Command";
import Delay from "@/domain/timers/Delay";
import RandomNumber from "@/domain/numbers/Random";
import UserConsumerBeginStatus from "@/domain/event/user/UserConsumerBeginStatus";
import UserConsumerCompletedStatus from "@/domain/event/user/UserConsumerCompletedStatus";
import UserConsumerFailedStatus from "@/domain/event/user/UserConsumerFailedStatus";

export async function main() {
    await Command(async ({ params, sendEventAndReturn, runWithLoop }) => {
        async function start({ userid: user_id = 0 }) {
            // runWithLoop(async () => {
            try {
                const { url } = await sendEventAndReturn(
                    {
                        data: { user_id },
                    },
                    new UserConsumerBeginStatus().getName()
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
                    new UserConsumerCompletedStatus().getName()
                );
            } catch (error) {
                await sendEventAndReturn(
                    {
                        data: {
                            user_id,
                        },
                    },
                    new UserConsumerFailedStatus().getName()
                );
            } finally {
                const timesecs = new RandomNumber().randomInRange(5, 10);
                await Delay(timesecs * 1000);
            }
            // });
        }

        await start(params as any);
    });
}

if (process.env.NODE_ENV !== "test") {
    main();
}
