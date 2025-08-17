import {
    IUserBeginPayload,
    IUserCompletedPayload,
    IUserFailedPayload,
    IUserParamsCMD,
} from "./interfaces";

import { CommandRunner } from "pevnt";
import { Delay } from "./Delay";

export async function main() {
    await CommandRunner<IUserParamsCMD>(
        async ({ params, sendEventAndReturn }) => {
            async function start({ userid: user_id = 0 }) {
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
        }
    );
}

if (process.env.NODE_ENV !== "test") {
    main();
}
