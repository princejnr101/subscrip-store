"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  RefreshCw,
  LogOut,
  Loader2,
  DollarSign,
  Users,
  AlertCircle,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { Order, OrderStatus, PaymentStatus } from "@/lib/types";

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function updateOrderStatus(
    orderId: string,
    updates: { status?: OrderStatus; paymentStatus?: PaymentStatus }
  ) {
    const token = localStorage.getItem("admin_token");
    if (!token) return;

    setUpdatingOrder(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? data.order : o))
        );
      }
    } catch {
      console.error("Failed to update order");
    } finally {
      setUpdatingOrder(null);
    }
  }

  function getWhatsAppLink(order: Order) {
    const phone = order.customerWhatsApp.replace(/[^0-9]/g, "");
    const message = `Hi ${order.customerName}! This is regarding your order ${order.id} for ${order.productName} (${order.planName}).`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  function getPaymentConfirmWhatsApp(order: Order) {
    const phone = order.customerWhatsApp.replace(/[^0-9]/g, "");
    const message = `Hi ${order.customerName}! Your payment for ${order.productName} (${order.planName}) has been confirmed. Your subscription is now being activated. Thank you!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  function logout() {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "pending") return order.status === "pending";
    if (filter === "processing") return order.status === "processing";
    if (filter === "completed") return order.status === "completed";
    if (filter === "unpaid") return order.paymentStatus === "unpaid";
    if (filter === "payment_pending")
      return order.paymentStatus === "pending_confirmation";
    if (filter === "payment_confirmed")
      return order.paymentStatus === "confirmed";
    return true;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    awaitingPayment: orders.filter(
      (o) => o.paymentStatus === "pending_confirmation"
    ).length,
    revenue: orders
      .filter((o) => o.paymentStatus === "confirmed")
      .reduce((sum, o) => sum + o.price, 0),
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 text-sm">
              Manage orders and customer communications
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/analytics"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
            <button
              onClick={fetchOrders}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
                <p className="text-xs text-gray-500">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.awaitingPayment}
                </p>
                <p className="text-xs text-gray-500">Awaiting Payment</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.revenue.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "Pending" },
            { key: "processing", label: "Processing" },
            { key: "completed", label: "Completed" },
            { key: "unpaid", label: "Unpaid" },
            { key: "payment_pending", label: "Payment Pending" },
            { key: "payment_confirmed", label: "Payment Confirmed" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f.key
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Order Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-mono text-sm font-bold text-gray-900">
                          {order.id}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.productName} - {order.planName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">
                        ${order.price.toFixed(2)}
                      </span>
                      <StatusBadge status={order.status} />
                      <PaymentBadge status={order.paymentStatus} />
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedOrder === order.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedOrder === order.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Info */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Customer Details
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="text-gray-500">Name:</span>{" "}
                            <span className="font-medium">
                              {order.customerName}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500">Email:</span>{" "}
                            <span className="font-medium">
                              {order.customerEmail}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500">WhatsApp:</span>{" "}
                            <span className="font-medium">
                              {order.customerWhatsApp}
                            </span>
                          </p>
                          <p>
                            <span className="text-gray-500">Date:</span>{" "}
                            <span className="font-medium">
                              {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </p>
                          {order.paymentReference && (
                            <p>
                              <span className="text-gray-500">
                                Payment Ref:
                              </span>{" "}
                              <span className="font-medium font-mono">
                                {order.paymentReference}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Actions
                        </h3>
                        <div className="space-y-2">
                          {/* WhatsApp Chat */}
                          <a
                            href={getWhatsAppLink(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Message on WhatsApp
                          </a>

                          {/* Order Status */}
                          <div className="flex gap-2">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                updateOrderStatus(order.id, {
                                  status: e.target.value as OrderStatus,
                                })
                              }
                              disabled={updatingOrder === order.id}
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <select
                              value={order.paymentStatus}
                              onChange={(e) =>
                                updateOrderStatus(order.id, {
                                  paymentStatus:
                                    e.target.value as PaymentStatus,
                                })
                              }
                              disabled={updatingOrder === order.id}
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="unpaid">Unpaid</option>
                              <option value="pending_confirmation">
                                Pending Confirm
                              </option>
                              <option value="confirmed">Confirmed</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>

                          {/* Quick Actions */}
                          {order.paymentStatus === "pending_confirmation" && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  updateOrderStatus(order.id, {
                                    paymentStatus: "confirmed",
                                    status: "processing",
                                  });
                                }}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Confirm Payment
                              </button>
                              <button
                                onClick={() =>
                                  updateOrderStatus(order.id, {
                                    paymentStatus: "rejected",
                                  })
                                }
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                                Reject
                              </button>
                            </div>
                          )}

                          {order.paymentStatus === "confirmed" && (
                            <a
                              href={getPaymentConfirmWhatsApp(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Send Confirmation via WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = {
    pending: {
      color: "bg-amber-100 text-amber-700",
      icon: Clock,
      label: "Pending",
    },
    processing: {
      color: "bg-blue-100 text-blue-700",
      icon: RefreshCw,
      label: "Processing",
    },
    completed: {
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
      label: "Completed",
    },
    cancelled: {
      color: "bg-red-100 text-red-700",
      icon: AlertCircle,
      label: "Cancelled",
    },
  };

  const { color, icon: Icon, label } = config[status];

  return (
    <span
      className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function PaymentBadge({ status }: { status: PaymentStatus }) {
  const config = {
    unpaid: { color: "bg-gray-100 text-gray-600", label: "Unpaid" },
    pending_confirmation: {
      color: "bg-amber-100 text-amber-700",
      label: "Pay Pending",
    },
    confirmed: { color: "bg-green-100 text-green-700", label: "Paid" },
    rejected: { color: "bg-red-100 text-red-700", label: "Rejected" },
  };

  const { color, label } = config[status];

  return (
    <span
      className={`hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}
