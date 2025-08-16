import { spawn } from "child_process";

export function runCommandSpawn(cmd: string, args: string[]) {
    return new Promise<{ code: number | null; stdout: string; stderr: string }>(
        (resolve) => {
            const child = spawn(cmd, args, { shell: true });

            let stdout = "";
            let stderr = "";

            child.stdout.on("data", (data) => {
                stdout += data.toString();
            });

            child.stderr.on("data", (data) => {
                stderr += data.toString();
            });

            child.on("close", (code) => {
                resolve({ code, stdout, stderr });
            });
        }
    );
}
