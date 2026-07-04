import { NextRequest, NextResponse } from "next/server";
import {
  getOrdersByClientId,
  getMessagesByOrderId,
  getClientById,
  getOrders,
} from "@/lib/store";
import { siteConfig } from "@/lib/config";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = token === siteConfig.adminPassword;

  try {
    let unreadCount = 0;

    if (isAdmin) {
      const allOrders = await getOrders();
      const ordersWithClients = allOrders.filter((o) => o.clientId);
      for (const order of ordersWithClients) {
        const messages = await getMessagesByOrderId(order.id);
        const clientMessages = messages.filter(
          (m) => m.senderType === "client"
        );
        if (clientMessages.length > 0) {
          unreadCount++;
        }
      }
    } else {
      const client = await getClientById(token);
      if (!client) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const orders = await getOrdersByClientId(client.id);
      for (const order of orders) {
        const messages = await getMessagesByOrderId(order.id);
        const adminMessages = messages.filter(
          (m) => m.senderType === "admin"
        );
        if (adminMessages.length > 0) {
          unreadCount++;
        }
      }
    }

    return NextResponse.json({ unreadCount });
  } catch {
    return NextResponse.json({ unreadCount: 0 });
  }
}
