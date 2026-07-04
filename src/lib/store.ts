import fs from "fs";
import path from "path";
import { Order } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
  }
}

export function getOrders(): Order[] {
  ensureDataDir();
  const data = fs.readFileSync(ORDERS_FILE, "utf-8");
  return JSON.parse(data);
}

export function getOrderById(id: string): Order | undefined {
  const orders = getOrders();
  return orders.find((o) => o.id === id);
}

export function createOrder(
  order: Omit<Order, "id" | "createdAt" | "updatedAt">
): Order {
  const orders = getOrders();
  const newOrder: Order = {
    ...order,
    id: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  return newOrder;
}

export function updateOrder(
  id: string,
  updates: Partial<Order>
): Order | null {
  const orders = getOrders();
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;

  orders[index] = {
    ...orders[index],
    ...updates,
    id: orders[index].id,
    createdAt: orders[index].createdAt,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  return orders[index];
}

export function deleteOrder(id: string): boolean {
  const orders = getOrders();
  const filtered = orders.filter((o) => o.id !== id);
  if (filtered.length === orders.length) return false;
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(filtered, null, 2));
  return true;
}
