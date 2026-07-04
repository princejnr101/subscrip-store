"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Subscrip Store
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Products
            </Link>
            <Link
              href="/payment"
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Track Order
            </Link>
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-3">
          <Link
            href="/"
            className="block text-gray-600 hover:text-indigo-600 font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/products"
            className="block text-gray-600 hover:text-indigo-600 font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Products
          </Link>
          <Link
            href="/payment"
            className="block text-gray-600 hover:text-indigo-600 font-medium"
            onClick={() => setMobileOpen(false)}
          >
            Track Order
          </Link>
        </div>
      )}
    </header>
  );
}
