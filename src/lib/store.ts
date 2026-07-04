import { put, list, del, get } from "@vercel/blob";
import { Order } from "./types";

const ORDERS_BLOB_PREFIX = "orders/";

function orderPath(id: string): string {
  return `${ORDERS_BLOB_PREFIX}${id}.json`;
}

async function readBlob(url: string): Promise<Order> {
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
  const text = new TextDecoder().decode(
    Buffer.concat(chunks)
  );
  return JSON.parse(text) as Order;
}

export async function getOrders(): Promise<Order[]> {
  try {
    const { blobs } = await list({ prefix: ORDERS_BLOB_PREFIX });
    if (blobs.length === 0) return [];

    const orders = await Promise.all(
      blobs.map(async (blob) => readBlob(blob.url))
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
    const { blobs } = await list({ prefix: orderPath(id) });
    if (blobs.length === 0) return undefined;

    return await readBlob(blobs[0].url);
  } catch {
    return undefined;
  }
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

  await put(orderPath(newOrder.id), JSON.stringify(newOrder), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });

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

  await put(orderPath(id), JSON.stringify(updated), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });

  return updated;
}

export async function deleteOrder(id: string): Promise<boolean> {
  try {
    const { blobs } = await list({ prefix: orderPath(id) });
    if (blobs.length === 0) return false;

    await del(blobs[0].url);
    return true;
  } catch {
    return false;
  }
}
