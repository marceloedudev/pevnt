import EventStatus from "@/domain/eventbus/EventStatus";

export default abstract class StepAbstraction {
    public abstract getStatus(): EventStatus;

    public abstract onMessage(payload: {
        data: any;
        type: string;
        id: string;
        pid: string;
    }): Promise<any>;
}
