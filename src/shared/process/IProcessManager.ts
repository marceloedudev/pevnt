import { IProcessLookupInput } from "./IProcessLookupInput";
import { IProcessLookupOutput } from "./IProcessLookupOutput";

export interface IProcessManager {
    getProcessRunning(
        params: IProcessLookupInput
    ): Promise<IProcessLookupOutput[]>;
    isProcessRunning(pid: string | number): Promise<boolean>;
    kill(pid: string): Promise<string>;
}
