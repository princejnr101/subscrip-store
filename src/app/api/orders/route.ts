import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrders } from "@/lib/store";
import { buildWhatsAppOrderNotification } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/config";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${siteConfig.adminPassword}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await getOrders();
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
      status: "pending",
      paymentStatus: "unpaid",
      paymentReference: "",
      adminNotes: "",
    });

    const whatsappUrl = buildWhatsAppOrderNotification(order);

    return NextResponse.json({ order, whatsappUrl }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to create order", details: message },
      { status: 500 }
    );
  }
}
