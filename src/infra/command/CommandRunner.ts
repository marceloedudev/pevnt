import { Arguments } from "../parser/Arguments";
import { IEventPayload } from "@/shared/interfaces/IEventResponseType";
import { MessageFactory } from "../eventbus/factory/MessageFactory";
import { workerData } from "worker_threads";

export async function CommandRunner<P = any>(
    fn: (context: {
        sendEventAndReturn: <I = any, O = any>(
            payload?: IEventPayload<I>,
            type?: string
        ) => Promise<O>;
        params: P;
    }) => Promise<void>
) {
    const resolveParamsMessage = async () => {
        const isWorkerThread = workerData;
        if (isWorkerThread) {
            return isWorkerThread;
        }
        const isProcessChild = process.argv;
        return new Arguments(isProcessChild).parse();
    };

    const eventMessage = new MessageFactory().createEventMessage();

    const params = await resolveParamsMessage();

    const sendEventAndReturn = async (
        payload?: IEventPayload,
        type?: string
    ) => {
        return eventMessage.sendEventAndReturn(payload, type);
    };

    await fn({ sendEventAndReturn, params });
}
