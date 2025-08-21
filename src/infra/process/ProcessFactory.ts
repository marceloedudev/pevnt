import { IProcessManager } from "@/shared/process/IProcessManager";
import { ProcessManager } from "./ProcessManager";

export class ProcessFactory {
    public createProcessManager(): IProcessManager {
        return new ProcessManager();
    }
}
