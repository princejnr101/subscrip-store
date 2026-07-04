import { put, list, del } from "@vercel/blob";
import { Order } from "./types";

const ORDERS_BLOB_PREFIX = "orders/";

function orderPath(id: string): string {
  return `${ORDERS_BLOB_PREFIX}${id}.json`;
}

export async function getOrders(): Promise<Order[]> {
  try {
    const { blobs } = await list({ prefix: ORDERS_BLOB_PREFIX });
    if (blobs.length === 0) return [];

    const orders = await Promise.all(
      blobs.map(async (blob) => {
        const res = await fetch(blob.downloadUrl);
        return (await res.json()) as Order;
      })
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

    const res = await fetch(blobs[0].downloadUrl);
    return (await res.json()) as Order;
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
    access: "public",
    addRandomSuffix: false,
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
    access: "public",
    addRandomSuffix: false,
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
