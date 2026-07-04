"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  LogOut,
  RefreshCw,
  MessageCircle,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { Order, OrderStatus, PaymentStatus } from "@/lib/types";

export default function AccountPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const token = localStorage.getItem("client_token");
    if (!token) {
      router.push("/account/login");
      return;
    }

    setClientName(localStorage.getItem("client_name") || "");

    try {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("client_token");
        localStorage.removeItem("client_name");
        localStorage.removeItem("client_id");
        router.push("/account/login");
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
  }, [fetchOrders]);

  function logout() {
    localStorage.removeItem("client_token");
    localStorage.removeItem("client_name");
    localStorage.removeItem("client_id");
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/account/login");
  }

  const stats = {
    total: orders.length,
    pending: orders.filter(
      (o) => o.status === "pending" || o.status === "processing"
    ).length,
    completed: orders.filter((o) => o.status === "completed").length,
    totalSpent: orders
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {clientName}
            </h1>
            <p className="text-gray-500 text-sm">
              Your orders and subscriptions
            </p>
          </div>
          <div className="flex items-center gap-3">
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
              Sign Out
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
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completed}
                </p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalSpent.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">Total Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Orders</h2>
          <Link
            href="/products"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + New Order
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No orders yet</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.productName} - {order.planName}
                      </p>
                      <p className="text-xs text-gray-400 font-mono">
                        {order.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">
                        ${order.price.toFixed(2)}
                      </span>
                      <OrderStatusBadge status={order.status} />
                      <PaymentBadge status={order.paymentStatus} />
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedOrder === order.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-500">Plan:</span>{" "}
                          <span className="font-medium">
                            {order.planName} ({order.planDuration})
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Date:</span>{" "}
                          <span className="font-medium">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Status:</span>{" "}
                          <span className="font-medium capitalize">
                            {order.status}
                          </span>
                        </p>
                        <p>
                          <span className="text-gray-500">Payment:</span>{" "}
                          <span className="font-medium capitalize">
                            {order.paymentStatus === "pending_confirmation"
                              ? "Awaiting confirmation"
                              : order.paymentStatus}
                          </span>
                        </p>
                        {order.paymentReference && (
                          <p>
                            <span className="text-gray-500">
                              Transaction ID:
                            </span>{" "}
                            <span className="font-medium font-mono">
                              {order.paymentReference}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Messages & Details
                        </Link>
                        {order.paymentStatus === "unpaid" && (
                          <Link
                            href="/payment"
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Confirm Payment
                          </Link>
                        )}
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

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const config = {
    pending: {
      color: "bg-amber-100 text-amber-700",
      icon: Clock,
      label: "Pending",
    },
    processing: {
      color: "bg-blue-100 text-blue-700",
      icon: RefreshCw,
      label: "In Progress",
    },
    completed: {
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
      label: "Done",
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
