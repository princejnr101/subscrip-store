import { put, list, del, get } from "@vercel/blob";
import { Order, Client, Message } from "./types";

// ---- Generic blob helpers ----

async function readBlobJson<T>(url: string): Promise<T> {
  const result = await get(url, { access: "private" });
  if (!result || !result.stream) throw new Error("Blob not found");
  const reader = result.stream.getReader();
  const chunks: Uint8Array[] = [];
  let done = false;
  while (!done) {
    const read = await reader.read();
    done = read.done;
    if (read.value) chunks.push(read.value);
  }
  const text = new TextDecoder().decode(Buffer.concat(chunks));
  return JSON.parse(text) as T;
}

async function writeBlobJson(path: string, data: unknown): Promise<void> {
  await put(path, JSON.stringify(data), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

async function listBlobs(prefix: string) {
  const { blobs } = await list({ prefix });
  return blobs;
}

// ---- Orders ----

const ORDERS_PREFIX = "orders/";

function orderPath(id: string): string {
  return `${ORDERS_PREFIX}${id}.json`;
}

export async function getOrders(): Promise<Order[]> {
  try {
    const blobs = await listBlobs(ORDERS_PREFIX);
    if (blobs.length === 0) return [];

    const orders = await Promise.all(
      blobs.map(async (blob) => readBlobJson<Order>(blob.url))
    );

    return orders.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  try {
    const blobs = await listBlobs(orderPath(id));
    if (blobs.length === 0) return undefined;
    return await readBlobJson<Order>(blobs[0].url);
  } catch {
    return undefined;
  }
}

export async function getOrdersByClientId(clientId: string): Promise<Order[]> {
  const allOrders = await getOrders();
  return allOrders.filter((o) => o.clientId === clientId);
}

export async function createOrder(
  order: Omit<Order, "id" | "createdAt" | "updatedAt">
): Promise<Order> {
  const newOrder: Order = {
    ...order,
    id: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await writeBlobJson(orderPath(newOrder.id), newOrder);
  return newOrder;
}

export async function updateOrder(
  id: string,
  updates: Partial<Order>
): Promise<Order | null> {
  const existing = await getOrderById(id);
  if (!existing) return null;

  const updated: Order = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  };

  await writeBlobJson(orderPath(id), updated);
  return updated;
}

export async function deleteOrder(id: string): Promise<boolean> {
  try {
    const blobs = await listBlobs(orderPath(id));
    if (blobs.length === 0) return false;
    await del(blobs[0].url);
    return true;
  } catch {
    return false;
  }
}

// ---- Clients ----

const CLIENTS_PREFIX = "clients/";

function clientPath(id: string): string {
  return `${CLIENTS_PREFIX}${id}.json`;
}

export async function getClients(): Promise<Client[]> {
  try {
    const blobs = await listBlobs(CLIENTS_PREFIX);
    if (blobs.length === 0) return [];
    return await Promise.all(
      blobs.map(async (blob) => readBlobJson<Client>(blob.url))
    );
  } catch {
    return [];
  }
}

export async function getClientById(id: string): Promise<Client | undefined> {
  try {
    const blobs = await listBlobs(clientPath(id));
    if (blobs.length === 0) return undefined;
    return await readBlobJson<Client>(blobs[0].url);
  } catch {
    return undefined;
  }
}

export async function getClientByEmail(
  email: string
): Promise<Client | undefined> {
  const clients = await getClients();
  return clients.find((c) => c.email.toLowerCase() === email.toLowerCase());
}

export async function createClient(
  client: Omit<Client, "id" | "createdAt">
): Promise<Client> {
  const newClient: Client = {
    ...client,
    id: `CLT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };

  await writeBlobJson(clientPath(newClient.id), newClient);
  return newClient;
}

// ---- Messages ----

const MESSAGES_PREFIX = "messages/";

function messagePath(orderId: string, messageId: string): string {
  return `${MESSAGES_PREFIX}${orderId}/${messageId}.json`;
}

export async function getMessagesByOrderId(
  orderId: string
): Promise<Message[]> {
  try {
    const blobs = await listBlobs(`${MESSAGES_PREFIX}${orderId}/`);
    if (blobs.length === 0) return [];

    const messages = await Promise.all(
      blobs.map(async (blob) => readBlobJson<Message>(blob.url))
    );

    return messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export async function createMessage(
  message: Omit<Message, "id" | "createdAt">
): Promise<Message> {
  const newMessage: Message = {
    ...message,
    id: `MSG-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };

  await writeBlobJson(
    messagePath(newMessage.orderId, newMessage.id),
    newMessage
  );
  return newMessage;
}

export async function getOrdersWithUnreadMessages(): Promise<string[]> {
  try {
    const blobs = await listBlobs(MESSAGES_PREFIX);
    const orderIds = new Set<string>();
    for (const blob of blobs) {
      const parts = blob.pathname.replace(MESSAGES_PREFIX, "").split("/");
      if (parts.length >= 1 && parts[0]) {
        orderIds.add(parts[0]);
      }
    }
    return Array.from(orderIds);
  } catch {
    return [];
  }
}
