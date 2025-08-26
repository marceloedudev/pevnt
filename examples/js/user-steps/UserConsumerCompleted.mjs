export class UserConsumerCompleted {
    getStatus() {
        return "completed";
    }

    async onMessage({ data }) {
        console.log("UserConsumerCompleted ", { data });
    }
}
