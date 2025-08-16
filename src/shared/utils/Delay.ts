import { setTimeout as sleep } from "node:timers/promises";

export const Delay = (ms: number) => sleep(ms);

export const DelayEx = (ms: number) =>
    new Promise((res) => setTimeout(res, ms));
