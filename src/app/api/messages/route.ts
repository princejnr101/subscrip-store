import { NextRequest, NextResponse } from "next/server";
import {
  getMessagesByOrderId,
  createMessage,
  getOrderById,
  getClientById,
} from "@/lib/store";
import { siteConfig } from "@/lib/config";

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json(
      { error: "orderId is required" },
      { status: 400 }
    );
  }

  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const isAdmin = token === siteConfig.adminPassword;
  if (!isAdmin) {
    const client = await getClientById(token);
    if (!client || client.id !== order.clientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const messages = await getMessagesByOrderId(orderId);
  return NextResponse.json({ messages });
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, text } = body;

    if (!orderId || !text) {
      return NextResponse.json(
        { error: "orderId and text are required" },
        { status: 400 }
      );
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const isAdmin = token === siteConfig.adminPassword;
    let senderId: string;
    let senderType: "client" | "admin";
    let senderName: string;

    if (isAdmin) {
      senderId = "admin";
      senderType = "admin";
      senderName = siteConfig.storeName;
    } else {
      const client = await getClientById(token);
      if (!client || client.id !== order.clientId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
      senderId = client.id;
      senderType = "client";
      senderName = client.name;
    }

    const message = await createMessage({
      orderId,
      senderId,
      senderType,
      senderName,
      text,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
