import runWithLoop, { Executable } from "./runWithLoop";

import EventMessage from "./EventMessage";
import { IEventPayload } from "@/domain/eventbus/IEventResponseType";
import ParserCommandLine from "./ParserCommandLine";

export async function Command(
    fn: (context: {
        sendEventAndReturn: (
            payload?: IEventPayload,
            type?: string
        ) => Promise<any>;
        runWithLoop(
            fn: Executable,
            loop?: boolean,
            delayMs?: number
        ): Promise<void>;
        params: any;
    }) => Promise<void>
) {
    const eventMessage = new EventMessage().create();
    const { params } = await new ParserCommandLine().execute(process.argv);

    const sendEventAndReturn = async (
        payload?: IEventPayload,
        type?: string
    ) => {
        return eventMessage.sendEventAndReturn(payload, type);
    };

    await fn({ sendEventAndReturn, runWithLoop, params });
}
