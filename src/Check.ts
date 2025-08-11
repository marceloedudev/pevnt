import ProcessManager from "./infra/eventbus/ProcessManager";

(async () => {
    try {
        const events = await new ProcessManager().getProcessRunning({
            arguments: [
                // "./src/commands/user-command.ts"
                // "--userid",
                "--itemid",
            ],
            // pid: "",
        });
        console.log({
            events,
            total: events.length,
            firstArgument: events?.[0]?.arguments ?? [],
        });
    } catch (error) {
        console.log({ error });
    }
})();
