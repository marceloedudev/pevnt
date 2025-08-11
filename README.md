# PEVNT

This project demonstrates how to implement a **Consumer** and a **Command** using an event-driven pattern, with support for **process** or **worker** transport types, and integration with `sendEventAndReturn`.

## 📌 Overview

The architecture is composed of two main components:

1. **Command** (`item-command.ts`)  
   Handles receiving parameters, executing actions (e.g., network requests, file I/O, system commands), and sending events to the `Consumer`.

2. **Consumer** (`ItemConsumer.ts`)  
   Receives events from the `Command`, processes the data (e.g., save to database, transform information), and returns responses.

---

### Command Implementation

```typescript
export async function main() {
    await Command(async ({ params, sendEventAndReturn, runWithLoop }) => {
        async function start({ itemid: item_id = 0 }) {
            const res = await sendEventAndReturn({
                data: { item_id },
            });
            console.log("item-command.ts >> ", { res });
            // Network requests, file operations, system commands...
            await Delay(5000);
        }
        await start(params as any);
    });
}

if (process.env.NODE_ENV !== "test") {
    main();
}
```

### Consumer Implementation

```typescript
export default class ItemConsumer extends ConsumerAbstraction {
    // DB instance...
    constructor() {
        super();
    }

    public transport(): ITransportType {
        return ITransportType.PROCESS; // or WORKER
    }

    public getCommand(params?: any): EventCommand {
        return new ItemConsumerCommand(params);
    }

    public getConsumers() {
        return async ({ data }) => {
            console.log("ItemConsumer.ts >> ", { data });
            // Processing logic (save to database)
            return { itemId: data.item_id };
        };
    }

    public async create({ params }) {
        const { id } = await super.create({
            params: { itemId: params.itemId },
        });
        return { id };
    }
}
```

---

## 📖 Execution Flow

1. **Command** (`item-command.ts`) is triggered.
2. It sends an event using `sendEventAndReturn`.
3. **Consumer** (`ItemConsumer.ts`) processes the received data and returns a response.
4. The **Command** continues execution after receiving the consumer's response.

---

## 🛠 Full Example

```typescript
// Executing the command directly
await Command(async ({ params, sendEventAndReturn }) => {
    const res = await sendEventAndReturn({
        data: { item_id: params.itemId },
    });
    console.log("Consumer response:", res);
});
```

```typescript
// Consumer processing an event
return async ({ data }) => {
    console.log("Processing item:", data.item_id);
    return { itemId: data.item_id };
};
```

---

## ⚙️ Transport Configuration

Inside the consumer’s `transport()` method, you can define:

-   `ITransportType.PROCESS` – Runs the consumer in a separate process.
-   `ITransportType.WORKER` – Runs the consumer in a worker thread.

---

## 🧪 Tests

If `NODE_ENV=test`, the `main()` function will **not** run automatically, allowing you to perform unit or integration tests.
