import { setTimeout as sleep } from "node:timers/promises";

const Delay = (ms: number) => sleep(ms);

export const DelayEx = (ms: number) =>
    new Promise((res) => setTimeout(res, ms));

export default Delay;
