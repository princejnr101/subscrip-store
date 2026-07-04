"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "@/lib/products";
import { Plan } from "@/lib/types";
import {
  ArrowLeft,
  Check,
  ShoppingCart,
  User,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";

export default function OrderPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const product = getProductBySlug(slug);

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Product Not Found
        </h1>
        <Link
          href="/products"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Browse all products
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan) {
      setError("Please select a plan");
      return;
    }
    if (!formData.name || !formData.email || !formData.whatsapp) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product!.id,
          productName: product!.name,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          planDuration: selectedPlan.duration,
          price: selectedPlan.price,
          currency: selectedPlan.currency,
          customerName: formData.name,
          customerEmail: formData.email,
          customerWhatsApp: formData.whatsapp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to place order");
      }

      router.push(
        `/order/success?orderId=${data.order.id}&whatsappUrl=${encodeURIComponent(data.whatsappUrl)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Info */}
          <div>
            <div
              className={`h-48 bg-gradient-to-br ${product.gradient} rounded-2xl flex items-center justify-center mb-6`}
            >
              <span className="text-7xl">{product.icon}</span>
            </div>

            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-3">
              {product.name}
            </h1>
            <p className="text-gray-500 mb-6">{product.longDescription}</p>

            <div className="space-y-2">
              {product.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Form */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm h-fit">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
              Place Your Order
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select a Plan
                </label>
                <div className="space-y-2">
                  {product.plans.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlan(plan);
                        setError("");
                      }}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        selectedPlan?.id === plan.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-semibold text-gray-900">
                          {plan.name}
                        </p>
                        <p className="text-sm text-gray-500">{plan.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ${plan.price}
                        </p>
                        <p className="text-xs text-gray-500">{plan.currency}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) =>
                        setFormData({ ...formData, whatsapp: e.target.value })
                      }
                      placeholder="+1234567890"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Place Order
                    {selectedPlan && ` - $${selectedPlan.price}`}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                After placing the order, you&apos;ll receive MTN MoMo payment
                details.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
