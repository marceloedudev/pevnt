import { Delay } from "../Delay.mjs";

export class UserConsumerBegin {
    getStatus() {
        return "begin";
    }

    async onMessage({ data }) {
        console.log("UserConsumerBegin ", { data });
        const { user_id } = data;
        const url = `string;;${user_id}`;
        await Delay(1000);
        if (user_id == 12) {
            throw new Error("invalid");
        }
        return {
            url,
        };
    }
}
