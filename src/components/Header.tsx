"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Menu, X, ShoppingBag, User, Bell } from "lucide-react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [clientName, setClientName] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("client_token");
    const name = localStorage.getItem("client_name");
    setLoggedIn(!!token);
    setClientName(name || "");
  }, []);

  useEffect(() => {
    checkAuth();

    function onStorage(e: StorageEvent) {
      if (e.key === "client_token" || e.key === "client_name") {
        checkAuth();
      }
    }

    function onAuthChange() {
      checkAuth();
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("auth-changed", onAuthChange);

    const interval = setInterval(checkAuth, 2000);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("auth-changed", onAuthChange);
      clearInterval(interval);
    };
  }, [checkAuth]);

  useEffect(() => {
    if (!loggedIn) {
      setUnreadCount(0);
      return;
    }

    async function fetchUnread() {
      const token = localStorage.getItem("client_token");
      if (!token) return;
      try {
        const res = await fetch("/api/messages/unread", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch {
        // ignore
      }
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
  }, [loggedIn]);

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
            {loggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/account"
                  className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors text-sm"
                >
                  <User className="w-4 h-4" />
                  {clientName || "My Account"}
                </Link>
              </div>
            ) : (
              <Link
                href="/account/login"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors text-sm"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}
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
          {loggedIn ? (
            <Link
              href="/account"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              <User className="w-4 h-4" />
              {clientName || "My Account"}
              {unreadCount > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>
          ) : (
            <Link
              href="/account/login"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              <User className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
