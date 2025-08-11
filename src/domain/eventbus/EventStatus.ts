export default abstract class EventStatus {
    private readonly name: string;

    constructor({ name }) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }
}
