# 📨 pevnt

A lightweight **Command runner + Consumer** for Node.js (TypeScript), supporting both **Worker Threads** and **Child Processes**.

---

## 📦 Installation

```bash
npm install pevnt
```

---

## 🚀 Quick Start

### 1. Create a Consumer

`src/main.ts`

```ts
import { MessageConsumerBase, ITransportType } from "pevnt";

const itemConsumer = new MessageConsumerBase()
    .transport(ITransportType.PROCESS) // or ITransportType.WORKER
    .filename("./src/item-command.ts")
    .consumers(async ({ data }) => {
        console.log({ data });
        return { itemId: data.item_id };
    })
    .onExit(({ id, code }) => {
        console.log("Consumer on exit:", { id, code });
    })
    .onStop(({ id }) => {
        console.log("Consumer on stop:", { id });
    });

// Run the consumer
const { id } = await itemConsumer.create({
    params: { itemId: 10 },
});

console.log({ exists: itemConsumer.exists(id) });

// Stop all running consumers later
for (const id of itemConsumer.listConsumers()) {
    await itemConsumer.stop(id);
}
```

---

### 2. Define the Command

`src/item-command.ts`

```ts
import { CommandRunner } from "pevnt";

export async function main() {
    await CommandRunner(async ({ params, sendEventAndReturn }) => {
        async function start({ itemid: item_id = 0 }) {
            const res = await sendEventAndReturn({
                data: { item_id },
            });
            console.log({ res });
        }

        await start(params);
    });
}

if (process.env.NODE_ENV !== "test") {
    main();
}
```

---

## 🔄 Flow

1. **Consumer** (`MessageConsumerBase`) is created with a chosen transport (worker or process).
2. A **Command** (`item-command.ts`) is registered with dynamic arguments.
3. When executed, the **CommandRunner** communicates with the Consumer by sending/receiving messages.
4. The `.consumers()` handler processes each incoming message.
5. Consumers can later be **listed** with `.listConsumers()` and **stopped** with `.stop(id)`.

---

## 📘 API Reference

### `MessageConsumerBase`

-   `.transport(type: ITransportType)` → defines transport (`worker` or `process`)
-   `.filename(path)` → registers filename
-   `.consumers(handler)` → handles incoming messages. (handler: Array of Class/Object or Function)

    ##### Function:

    ```ts
    .consumers(async ({ data }) => {
        return { itemId: data.item_id };
    })
    ```

    ##### Class/Object required methods: .getStatus() => "myStringId" .onMessage({ data }): Promise<any>

```ts
class UserConsumerCompleted implements IStepMessage {
    public getStatus(): string {
        return "completed";
    }

    public async onMessage({ data }) {
        // code
    }
}
```

-   `.create({ params })` → executes the command with given parameters
-   `.listConsumers()` → iterable of running consumer IDs
-   `.stop(id)` → stops a specific consumer
-   `.exists(id)` → check if it is running
-   `.onExit(handler: (args: { id: number; code: number }) => void)` → listen when executing .exit event
-   `.onStop(handler: (args: { id: number }) => void)` → listen when stopped

### `CommandRunner`

Runs a command file with access to:

-   `params` → parsed params from .create()
-   `sendEventAndReturn(payload, type?: string)` → sends a message back to the consumer and waits for response. (type: status id from .consumers(handler))

---

## 🌐 Transport Options

```ts
enum ITransportType {
    WORKER = "worker",
    PROCESS = "process",
}
```

-   **worker** → uses `Worker Threads`
-   **process** → uses `Child Process`
