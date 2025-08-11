import BadRequestException from "@/domain/error/BadRequestException";
import { promisify } from "node:util";
import ps from "ps-node";

export interface IProcessLookupInput {
    pid?: string;
    command?: string;
    arguments?: string[];
}

export interface IProcessLookupOutput {
    pid: string;
    command: string;
    arguments: string[];
}

export const psLookupAsync = promisify(ps.lookup) as (
    options: IProcessLookupInput
) => Promise<ps.Program[]>;

export const killAsync = promisify(ps.kill);

export default class ProcessManager {
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
            throw new BadRequestException(errorMessage);
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
            throw new BadRequestException(err?.name || "Kill Error");
        }
    }
}
