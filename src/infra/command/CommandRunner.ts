import { CommandLineParser } from "./CommandLineParser";
import { IEventPayload } from "@/shared/interfaces/IEventResponseType";
import { MessageFactory } from "../eventbus/factory/MessageFactory";

export async function CommandRunner<P = any>(
    fn: (context: {
        sendEventAndReturn: <I = any, O = any>(
            payload?: IEventPayload<I>,
            type?: string
        ) => Promise<O>;
        params: P;
    }) => Promise<void>
) {
    const eventMessage = new MessageFactory().createEventMessage();
    const { params } = (await new CommandLineParser().execute(
        process.argv
    )) as { params: P };

    const sendEventAndReturn = async (
        payload?: IEventPayload,
        type?: string
    ) => {
        return eventMessage.sendEventAndReturn(payload, type);
    };

    await fn({ sendEventAndReturn, params });
}
