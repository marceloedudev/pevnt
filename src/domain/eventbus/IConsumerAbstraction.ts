export default interface IConsumerAbstraction {
    register({ command, consumers }): Promise<IConsumerAbstraction>;
    events({ onExit }): Promise<IConsumerAbstraction>;
    stop(): Promise<void>;
}
