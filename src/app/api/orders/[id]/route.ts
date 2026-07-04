import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrder } from "@/lib/store";
import { buildPaymentSubmittedNotification } from "@/lib/whatsapp";
import { siteConfig } from "@/lib/config";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const order = await getOrderById(params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const adminFields = ["status", "adminNotes"];
    const isAdminUpdate = adminFields.some((field) => field in body);

    if (isAdminUpdate) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${siteConfig.adminPassword}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const allowedFields = isAdminUpdate
      ? [
          "status",
          "paymentStatus",
          "paymentReference",
          "adminNotes",
        ]
      : ["paymentStatus", "paymentReference"];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    const order = await updateOrder(params.id, updates);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const response: Record<string, unknown> = { order };

    if (
      !isAdminUpdate &&
      body.paymentStatus === "pending_confirmation" &&
      body.paymentReference
    ) {
      response.whatsappUrl = buildPaymentSubmittedNotification(
        order,
        body.paymentReference
      );
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
