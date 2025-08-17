# 📨 pevnt

A lightweight **Command runner + Consumer abstraction** for Node.js (TypeScript), supporting both **Worker Threads** and **Child Processes**.

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
    .command(({ params }) => ({
        filename: "./src/item-command.ts",
        argv: ["--itemid", `${params.itemId}`],
    }))
    .consumers(async ({ data }) => {
        console.log({ data });
        return { itemId: data.item_id };
    });

// Run the consumer
await itemConsumer.create({
    params: { itemId: 10 },
});

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
-   `.command(fn)` → registers the command with `filename` and `argv`
-   `.consumers(handler)` → handles incoming messages
-   `.create({ params })` → executes the command with given parameters
-   `.listConsumers()` → async iterable of running consumer IDs
-   `.stop(id)` → stops a specific consumer

### `CommandRunner`

Runs a command file with access to:

-   `params` → parsed CLI arguments
-   `sendEventAndReturn(payload, type?: string)` → sends a message back to the consumer and waits for response

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
