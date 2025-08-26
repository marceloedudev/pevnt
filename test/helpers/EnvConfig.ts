export class EnvConfig {
    public isTest(): boolean {
        return process.env.NODE_ENV === "test";
    }
}
