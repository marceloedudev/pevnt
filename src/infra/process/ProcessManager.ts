import { Exception } from "@/shared/errors/Exception";
import { IProcessLookupInput } from "@/shared/process/IProcessLookupInput";
import { IProcessLookupOutput } from "@/shared/process/IProcessLookupOutput";
import { IProcessManager } from "@/shared/process/IProcessManager";
import { promisify } from "node:util";
import ps from "ps-node";

const psLookupAsync = promisify(ps.lookup) as (
    options: IProcessLookupInput
) => Promise<ps.Program[]>;

const killAsync = promisify(ps.kill);

export class ProcessManager implements IProcessManager {
    public async getProcessRunning(
        params: IProcessLookupInput
    ): Promise<IProcessLookupOutput[]> {
        try {
            const resultList = await psLookupAsync(params);

            return resultList.map((proc) => ({
                pid: String(proc.pid),
                command: proc.command,
                arguments: Array.isArray(proc.arguments)
                    ? proc.arguments
                    : [String(proc.arguments ?? "")],
            }));
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error ? err.message : "Unknown error";
            throw new Exception(errorMessage);
        }
    }

    public async isProcessRunning(pid: string | number): Promise<boolean> {
        if (!pid) {
            return false;
        }

        try {
            const streamerProcess = await this.getProcessRunning({
                pid: `${pid}`,
            });
            return streamerProcess.length > 0;
        } catch {
            return false;
        }
    }

    public async kill(pid: string): Promise<string> {
        try {
            await killAsync(pid);
            return pid;
        } catch (err: any) {
            throw new Error(err?.name || "Kill Error");
        }
    }
}
