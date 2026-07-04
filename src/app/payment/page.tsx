"use client";

import { useState } from "react";
import {
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Upload,
} from "lucide-react";
import { Order } from "@/lib/types";

export default function PaymentPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function searchOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);
    setSuccess(false);

    try {
      const res = await fetch(`/api/orders/${orderId.trim()}`);
      if (!res.ok) {
        throw new Error("Order not found. Please check your Order ID.");
      }
      const data = await res.json();
      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function confirmPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!order || !paymentRef.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: "pending_confirmation",
          paymentReference: paymentRef.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit payment confirmation");
      }

      const data = await res.json();
      setOrder(data.order);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function getStatusBadge(order: Order) {
    const statusConfig = {
      pending: {
        color: "bg-amber-100 text-amber-700",
        icon: Clock,
        label: "Pending",
      },
      processing: {
        color: "bg-blue-100 text-blue-700",
        icon: Loader2,
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

    const config = statusConfig[order.status];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  }

  function getPaymentBadge(order: Order) {
    const paymentConfig = {
      unpaid: { color: "bg-gray-100 text-gray-700", label: "Unpaid" },
      pending_confirmation: {
        color: "bg-amber-100 text-amber-700",
        label: "Awaiting Confirmation",
      },
      confirmed: {
        color: "bg-green-100 text-green-700",
        label: "Payment Confirmed",
      },
      rejected: {
        color: "bg-red-100 text-red-700",
        label: "Payment Rejected",
      },
    };

    const config = paymentConfig[order.paymentStatus];
    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  }

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Track & Confirm Payment
          </h1>
          <p className="text-gray-500">
            Enter your Order ID to check status or confirm your payment.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={searchOrder} className="mb-8">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your Order ID (e.g., ORD-...)"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-medium transition-colors"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm mb-6 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            Payment confirmation submitted! We&apos;ll verify and activate your
            subscription shortly.
          </div>
        )}

        {order && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">Order</p>
                <p className="font-bold text-gray-900 font-mono">{order.id}</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {getStatusBadge(order)}
                {getPaymentBadge(order)}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Product</span>
                <span className="font-medium text-gray-900">
                  {order.productName}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Plan</span>
                <span className="font-medium text-gray-900">
                  {order.planName} ({order.planDuration})
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-gray-900">
                  ${order.price.toFixed(2)} {order.currency}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {order.paymentStatus === "unpaid" && (
              <form onSubmit={confirmPayment} className="space-y-4">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-amber-700 text-sm font-medium mb-2">
                    Payment Pending
                  </p>
                  <p className="text-amber-600 text-sm">
                    Please send your MTN MoMo payment and enter the
                    transaction ID below to confirm.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MoMo Transaction ID
                  </label>
                  <div className="relative">
                    <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="Enter your MoMo transaction ID"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Confirm Payment
                    </>
                  )}
                </button>
              </form>
            )}

            {order.paymentStatus === "pending_confirmation" && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-blue-700 text-sm font-medium">
                  Payment Reference: {order.paymentReference}
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  Your payment is being verified. We&apos;ll notify you on
                  WhatsApp once confirmed.
                </p>
              </div>
            )}

            {order.paymentStatus === "confirmed" && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-700 text-sm font-medium">
                  Payment confirmed! Your subscription is being activated.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
