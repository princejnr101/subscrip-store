"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  CheckCircle,
  Copy,
  MessageCircle,
  ArrowRight,
  Smartphone,
} from "lucide-react";
import { useState } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const whatsappUrl = searchParams.get("whatsappUrl") || "";
  const [copied, setCopied] = useState(false);

  const momoName =
    process.env.NEXT_PUBLIC_MOMO_NAME || "Your MoMo Name";
  const momoNumber =
    process.env.NEXT_PUBLIC_MOMO_NUMBER || "0000000000";
  const momoInfo =
    process.env.NEXT_PUBLIC_MOMO_INFO ||
    "Please include your Order ID as payment reference when sending";

  function copyOrderId() {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-500">
            Your order has been received. Please complete the payment via MTN
            Mobile Money to activate your subscription.
          </p>
        </div>

        {/* Order ID */}
        <div className="bg-indigo-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">Order ID</p>
              <p className="text-xl font-bold text-gray-900 font-mono">
                {orderId}
              </p>
            </div>
            <button
              onClick={copyOrderId}
              className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
              title="Copy Order ID"
            >
              {copied ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* MoMo Payment Details */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-yellow-500" />
            MTN Mobile Money Payment
          </h2>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-4">
            <p className="text-yellow-800 text-sm font-medium">
              Send payment via MTN MoMo to:
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">MoMo Name</span>
              <span className="font-medium text-gray-900">{momoName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">MoMo Number</span>
              <span className="font-bold text-gray-900 text-lg">
                {momoNumber}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Reference</span>
              <span className="font-medium text-indigo-600 font-mono text-sm">
                {orderId}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
            {momoInfo}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {whatsappUrl && (
            <a
              href={decodeURIComponent(whatsappUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Notify Seller on WhatsApp
            </a>
          )}

          <Link
            href="/payment"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            Confirm Payment
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/products"
            className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            After sending your MoMo payment, click &ldquo;Confirm
            Payment&rdquo; or notify us on WhatsApp with your transaction ID.
            We&apos;ll activate your subscription as soon as payment is
            verified.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-gray-500">Loading...</div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
