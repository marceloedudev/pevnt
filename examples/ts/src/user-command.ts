import {
    IUserBeginPayload,
    IUserCompletedPayload,
    IUserFailedPayload,
    IUserParams,
} from "./interfaces";

// import { CommandRunner } from "pevnt";
import { CommandRunner } from "../../../dist";
import { Delay } from "./Delay";

export async function main() {
    await CommandRunner<IUserParams>(async ({ params, sendEventAndReturn }) => {
        async function start({ userId: user_id = 0 }) {
            try {
                const { url } = await sendEventAndReturn<IUserBeginPayload>(
                    {
                        data: { user_id },
                    },
                    "begin"
                );
                console.log({ url });
                //
                // code...
                //
                await sendEventAndReturn<IUserCompletedPayload>(
                    {
                        data: {
                            user_id,
                            url,
                        },
                    },
                    "completed"
                );
            } catch (error) {
                await sendEventAndReturn<IUserFailedPayload>(
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
