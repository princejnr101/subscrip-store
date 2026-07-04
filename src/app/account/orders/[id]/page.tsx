"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  MessageCircle,
} from "lucide-react";
import { Order, Message } from "@/lib/types";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("client_token");
    if (!token) {
      router.push("/account/login");
      return;
    }

    try {
      const [orderRes, messagesRes] = await Promise.all([
        fetch(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/messages?orderId=${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrder(orderData.order);
      }

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData.messages || []);
      }
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem("client_token");
    if (!token) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, text: newMessage.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
      }
    } catch {
      console.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Order not found</p>
        <Link
          href="/account"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const statusConfig = {
    pending: { color: "text-amber-600", bg: "bg-amber-50", icon: Clock, label: "Pending" },
    processing: { color: "text-blue-600", bg: "bg-blue-50", icon: RefreshCw, label: "In Progress" },
    completed: { color: "text-green-600", bg: "bg-green-50", icon: CheckCircle, label: "Completed" },
    cancelled: { color: "text-red-600", bg: "bg-red-50", icon: AlertCircle, label: "Cancelled" },
  };

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/account"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
            <p className="text-sm text-gray-500 font-mono">{order.id}</p>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              {order.productName} - {order.planName}
            </h2>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
              <StatusIcon className="w-4 h-4" />
              {status.label}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Plan Duration</p>
              <p className="font-medium text-gray-900">{order.planDuration}</p>
            </div>
            <div>
              <p className="text-gray-500">Price</p>
              <p className="font-medium text-gray-900">
                ${order.price.toFixed(2)} {order.currency}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Order Date</p>
              <p className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Payment Status</p>
              <p className="font-medium text-gray-900 capitalize">
                {order.paymentStatus === "pending_confirmation"
                  ? "Awaiting confirmation"
                  : order.paymentStatus}
              </p>
            </div>
            {order.paymentReference && (
              <div className="col-span-2">
                <p className="text-gray-500">Transaction ID</p>
                <p className="font-medium text-gray-900 font-mono">
                  {order.paymentReference}
                </p>
              </div>
            )}
          </div>

          {/* Progress tracker */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Order Progress
            </p>
            <div className="flex items-center gap-2">
              {["pending", "processing", "completed"].map((step, i) => {
                const steps = ["pending", "processing", "completed"];
                const currentIdx = steps.indexOf(order.status);
                const isActive = i <= currentIdx && order.status !== "cancelled";
                return (
                  <div key={step} className="flex-1 flex items-center gap-2">
                    <div
                      className={`w-full h-2 rounded-full ${
                        isActive ? "bg-indigo-500" : "bg-gray-200"
                      }`}
                    />
                    {i < steps.length - 1 && <div className="w-0" />}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">Placed</span>
              <span className="text-xs text-gray-500">In Progress</span>
              <span className="text-xs text-gray-500">Done</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-gray-900">Messages</h2>
            <span className="text-xs text-gray-400">
              Chat with the seller about your order
            </span>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-sm">
                  No messages yet. Send a message to the seller.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderType === "client"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      msg.senderType === "client"
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        msg.senderType === "client"
                          ? "text-indigo-200"
                          : "text-gray-400"
                      }`}
                    >
                      {msg.senderName} &bull;{" "}
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={sendMessage}
            className="p-3 border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl transition-colors"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
