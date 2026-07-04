import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/store";
import { siteConfig } from "@/lib/config";
import { Order } from "@/lib/types";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${siteConfig.adminPassword}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders = await getOrders();

  const analytics = buildAnalytics(orders);
  return NextResponse.json({ analytics });
}

function buildAnalytics(orders: Order[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const confirmedOrders = orders.filter(
    (o) => o.paymentStatus === "confirmed"
  );

  // Overview stats
  const overview = {
    totalOrders: orders.length,
    completedOrders: orders.filter((o) => o.status === "completed").length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    processingOrders: orders.filter((o) => o.status === "processing").length,
    cancelledOrders: orders.filter((o) => o.status === "cancelled").length,
    totalRevenue: confirmedOrders.reduce((sum, o) => sum + o.price, 0),
    averageOrderValue:
      confirmedOrders.length > 0
        ? confirmedOrders.reduce((sum, o) => sum + o.price, 0) /
          confirmedOrders.length
        : 0,
    conversionRate:
      orders.length > 0
        ? (confirmedOrders.length / orders.length) * 100
        : 0,
    unpaidOrders: orders.filter((o) => o.paymentStatus === "unpaid").length,
    awaitingConfirmation: orders.filter(
      (o) => o.paymentStatus === "pending_confirmation"
    ).length,
    confirmedPayments: confirmedOrders.length,
    rejectedPayments: orders.filter(
      (o) => o.paymentStatus === "rejected"
    ).length,
  };

  // Time-based stats
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt) >= today
  );
  const thisWeekOrders = orders.filter(
    (o) => new Date(o.createdAt) >= thisWeekStart
  );
  const thisMonthOrders = orders.filter(
    (o) => new Date(o.createdAt) >= thisMonthStart
  );

  const timeBased = {
    today: {
      orders: todayOrders.length,
      revenue: todayOrders
        .filter((o) => o.paymentStatus === "confirmed")
        .reduce((sum, o) => sum + o.price, 0),
    },
    thisWeek: {
      orders: thisWeekOrders.length,
      revenue: thisWeekOrders
        .filter((o) => o.paymentStatus === "confirmed")
        .reduce((sum, o) => sum + o.price, 0),
    },
    thisMonth: {
      orders: thisMonthOrders.length,
      revenue: thisMonthOrders
        .filter((o) => o.paymentStatus === "confirmed")
        .reduce((sum, o) => sum + o.price, 0),
    },
  };

  // Revenue by product
  const productMap = new Map<
    string,
    { name: string; orders: number; revenue: number; pending: number }
  >();
  for (const order of orders) {
    const existing = productMap.get(order.productId) || {
      name: order.productName,
      orders: 0,
      revenue: 0,
      pending: 0,
    };
    existing.orders += 1;
    if (order.paymentStatus === "confirmed") {
      existing.revenue += order.price;
    }
    if (
      order.paymentStatus === "unpaid" ||
      order.paymentStatus === "pending_confirmation"
    ) {
      existing.pending += 1;
    }
    productMap.set(order.productId, existing);
  }
  const byProduct = Array.from(productMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // Revenue by plan type
  const planMap = new Map<
    string,
    { name: string; orders: number; revenue: number }
  >();
  for (const order of orders) {
    const key = `${order.productName} - ${order.planName}`;
    const existing = planMap.get(key) || {
      name: key,
      orders: 0,
      revenue: 0,
    };
    existing.orders += 1;
    if (order.paymentStatus === "confirmed") {
      existing.revenue += order.price;
    }
    planMap.set(key, existing);
  }
  const byPlan = Array.from(planMap.values()).sort(
    (a, b) => b.orders - a.orders
  );

  // Daily orders for last 30 days
  const dailyData: { date: string; orders: number; revenue: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayOrders = orders.filter(
      (o) => o.createdAt.split("T")[0] === dateStr
    );
    dailyData.push({
      date: dateStr,
      orders: dayOrders.length,
      revenue: dayOrders
        .filter((o) => o.paymentStatus === "confirmed")
        .reduce((sum, o) => sum + o.price, 0),
    });
  }

  // Order status distribution
  const statusDistribution = [
    {
      name: "Pending",
      value: overview.pendingOrders,
      color: "#f59e0b",
    },
    {
      name: "Processing",
      value: overview.processingOrders,
      color: "#3b82f6",
    },
    {
      name: "Completed",
      value: overview.completedOrders,
      color: "#22c55e",
    },
    {
      name: "Cancelled",
      value: overview.cancelledOrders,
      color: "#ef4444",
    },
  ].filter((s) => s.value > 0);

  // Payment status distribution
  const paymentDistribution = [
    { name: "Unpaid", value: overview.unpaidOrders, color: "#9ca3af" },
    {
      name: "Awaiting Confirmation",
      value: overview.awaitingConfirmation,
      color: "#f59e0b",
    },
    {
      name: "Confirmed",
      value: overview.confirmedPayments,
      color: "#22c55e",
    },
    {
      name: "Rejected",
      value: overview.rejectedPayments,
      color: "#ef4444",
    },
  ].filter((s) => s.value > 0);

  // Top customers
  const customerMap = new Map<
    string,
    {
      name: string;
      whatsapp: string;
      orders: number;
      totalSpent: number;
    }
  >();
  for (const order of orders) {
    const key = order.customerWhatsApp;
    const existing = customerMap.get(key) || {
      name: order.customerName,
      whatsapp: order.customerWhatsApp,
      orders: 0,
      totalSpent: 0,
    };
    existing.orders += 1;
    if (order.paymentStatus === "confirmed") {
      existing.totalSpent += order.price;
    }
    customerMap.set(key, existing);
  }
  const topCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  // Recent orders
  const recentOrders = orders.slice(0, 10).map((o) => ({
    id: o.id,
    product: o.productName,
    plan: o.planName,
    customer: o.customerName,
    price: o.price,
    currency: o.currency,
    status: o.status,
    paymentStatus: o.paymentStatus,
    date: o.createdAt,
  }));

  return {
    overview,
    timeBased,
    byProduct,
    byPlan,
    dailyData,
    statusDistribution,
    paymentDistribution,
    topCustomers,
    recentOrders,
  };
}
