import { NextRequest, NextResponse } from "next/server";
import {
  createOrder,
  getOrders,
  getOrdersByClientId,
  getClientById,
} from "@/lib/store";
import { buildWhatsAppOrderNotification } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/config";

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (token === siteConfig.adminPassword) {
    const orders = await getOrders();
    return NextResponse.json({ orders });
  }

  const client = await getClientById(token);
  if (!client) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await getOrdersByClientId(client.id);
  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productId,
      productName,
      planId,
      planName,
      planDuration,
      price,
      currency,
      customerName,
      customerEmail,
      customerWhatsApp,
    } = body;

    if (
      !productId ||
      !productName ||
      !planId ||
      !planName ||
      !price ||
      !customerName ||
      !customerEmail ||
      !customerWhatsApp
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let clientId: string | undefined;
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (token) {
      const client = await getClientById(token);
      if (client) {
        clientId = client.id;
      }
    }

    const order = await createOrder({
      productId,
      productName,
      planId,
      planName,
      planDuration: planDuration || "",
      price,
      currency: currency || "USD",
      customerName,
      customerEmail,
      customerWhatsApp,
      clientId,
      status: "pending",
      paymentStatus: "unpaid",
      paymentReference: "",
      adminNotes: "",
    });

    const whatsappUrl = buildWhatsAppOrderNotification(order);

    return NextResponse.json({ order, whatsappUrl }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
