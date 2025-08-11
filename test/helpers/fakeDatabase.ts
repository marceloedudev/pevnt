globalThis.fakeDatabase = {
    consumers: [],
    setConsumers(consumers) {
        this.consumers = consumers;
    },
    getConsumers() {
        return this.consumers;
    },
};
