export class UserConsumerFailed {
    getStatus() {
        return "failed";
    }

    async onMessage({ data }) {
        console.log("UserConsumerFailed ", { data });
    }
}
