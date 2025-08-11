import Delay from "@/domain/timers/Delay";

export type Executable = () => void | Promise<void>;

export default async function runWithLoop(
    fn: Executable,
    loop: boolean = true,
    delayMs: number = 0
): Promise<void> {
    const isTestEnv = process.env.NODE_ENV === "test";

    if (isTestEnv && loop) {
        console.warn(
            "[runWithLoop] Loop skipped in test environment (NODE_ENV=test)"
        );
    }

    if (loop && !isTestEnv) {
        while (true) {
            await fn();
            if (delayMs > 0) await Delay(delayMs);
        }
    } else {
        await fn();
    }
}
