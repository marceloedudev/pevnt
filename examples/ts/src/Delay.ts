import { setTimeout as sleep } from "node:timers/promises";

export const Delay = (ms: number) => sleep(ms);
