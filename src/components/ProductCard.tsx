import Link from "next/link";
import { Product } from "@/lib/types";
import { ArrowRight, Check } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const lowestPrice = Math.min(...product.plans.map((p) => p.price));

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden">
      <div
        className={`h-32 bg-gradient-to-br ${product.gradient} flex items-center justify-center`}
      >
        <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
          {product.icon}
        </span>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              {product.category}
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-2">
              {product.name}
            </h3>
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-4">{product.description}</p>

        <div className="space-y-2 mb-4">
          {product.features.slice(0, 3).map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div>
            <span className="text-sm text-gray-500">From</span>
            <p className="text-2xl font-bold text-gray-900">
              ${lowestPrice}
              <span className="text-sm font-normal text-gray-500">/mo</span>
            </p>
          </div>

          <Link
            href={`/order/${product.slug}`}
            className="flex items-center gap-1 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium text-sm transition-colors group/btn"
          >
            Order
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
