import { IEventPayload } from "@/shared/interfaces/IEventResponseType";
import { MessageFactory } from "../eventbus/factory/MessageFactory";
import { ParserFactory } from "../acmdp/ParserFactory";
import { workerData } from "worker_threads";

const getParamsFromArgv = (argv: string[]) => {
    let params = {};
    if (argv?.length > 0) {
        params = new ParserFactory().createArgumentsParser().parse(argv);
    }
    return params;
};

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
        return getParamsFromArgv(isProcessChild);
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
