"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Calendar,
  Target,
  Percent,
} from "lucide-react";

interface Analytics {
  overview: {
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    processingOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    conversionRate: number;
    unpaidOrders: number;
    awaitingConfirmation: number;
    confirmedPayments: number;
    rejectedPayments: number;
  };
  timeBased: {
    today: { orders: number; revenue: number };
    thisWeek: { orders: number; revenue: number };
    thisMonth: { orders: number; revenue: number };
  };
  byProduct: {
    id: string;
    name: string;
    orders: number;
    revenue: number;
    pending: number;
  }[];
  byPlan: { name: string; orders: number; revenue: number }[];
  dailyData: { date: string; orders: number; revenue: number }[];
  statusDistribution: { name: string; value: number; color: string }[];
  paymentDistribution: { name: string; value: number; color: string }[];
  topCustomers: {
    name: string;
    whatsapp: string;
    orders: number;
    totalSpent: number;
  }[];
  recentOrders: {
    id: string;
    product: string;
    plan: string;
    customer: string;
    price: number;
    currency: string;
    status: string;
    paymentStatus: string;
    date: string;
  }[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const res = await fetch("/api/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
        return;
      }

      const data = await res.json();
      setAnalytics(data.analytics);
    } catch {
      console.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    );
  }

  const { overview, timeBased, byProduct, byPlan, dailyData, statusDistribution, paymentDistribution, topCustomers, recentOrders } = analytics;

  const formatDailyLabel = (date: string) => {
    const d = new Date(date + "T00:00:00");
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sales Analytics
              </h1>
              <p className="text-gray-500 text-sm">
                Detailed overview of your business performance
              </p>
            </div>
          </div>
          <button
            onClick={fetchAnalytics}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={DollarSign}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            label="Total Revenue"
            value={`$${overview.totalRevenue.toFixed(2)}`}
          />
          <MetricCard
            icon={ShoppingCart}
            iconBg="bg-indigo-100"
            iconColor="text-indigo-600"
            label="Total Orders"
            value={overview.totalOrders.toString()}
          />
          <MetricCard
            icon={Target}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            label="Avg Order Value"
            value={`$${overview.averageOrderValue.toFixed(2)}`}
          />
          <MetricCard
            icon={Percent}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            label="Conversion Rate"
            value={`${overview.conversionRate.toFixed(1)}%`}
          />
        </div>

        {/* Time-Based Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-700">Today</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {timeBased.today.orders} orders
            </p>
            <p className="text-sm text-green-600 font-medium">
              ${timeBased.today.revenue.toFixed(2)} revenue
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-700">This Week</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {timeBased.thisWeek.orders} orders
            </p>
            <p className="text-sm text-green-600 font-medium">
              ${timeBased.thisWeek.revenue.toFixed(2)} revenue
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-gray-700">
                This Month
              </h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {timeBased.thisMonth.orders} orders
            </p>
            <p className="text-sm text-green-600 font-medium">
              ${timeBased.thisMonth.revenue.toFixed(2)} revenue
            </p>
          </div>
        </div>

        {/* Order & Payment Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Order Status
            </h3>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <StatusItem
                icon={Clock}
                color="text-amber-600"
                bg="bg-amber-50"
                label="Pending"
                value={overview.pendingOrders}
              />
              <StatusItem
                icon={RefreshCw}
                color="text-blue-600"
                bg="bg-blue-50"
                label="Processing"
                value={overview.processingOrders}
              />
              <StatusItem
                icon={CheckCircle}
                color="text-green-600"
                bg="bg-green-50"
                label="Completed"
                value={overview.completedOrders}
              />
              <StatusItem
                icon={AlertCircle}
                color="text-red-600"
                bg="bg-red-50"
                label="Cancelled"
                value={overview.cancelledOrders}
              />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Payment Status
            </h3>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <StatusItem
                icon={AlertCircle}
                color="text-gray-600"
                bg="bg-gray-50"
                label="Unpaid"
                value={overview.unpaidOrders}
              />
              <StatusItem
                icon={Clock}
                color="text-amber-600"
                bg="bg-amber-50"
                label="Awaiting"
                value={overview.awaitingConfirmation}
              />
              <StatusItem
                icon={CheckCircle}
                color="text-green-600"
                bg="bg-green-50"
                label="Confirmed"
                value={overview.confirmedPayments}
              />
              <StatusItem
                icon={AlertCircle}
                color="text-red-600"
                bg="bg-red-50"
                label="Rejected"
                value={overview.rejectedPayments}
              />
            </div>
          </div>
        </div>

        {/* Charts Row 1: Daily Trend + Status Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              Orders &amp; Revenue (Last 30 Days)
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDailyLabel}
                    tick={{ fontSize: 11 }}
                    stroke="#9ca3af"
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11 }}
                    stroke="#9ca3af"
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    stroke="#9ca3af"
                  />
                  <Tooltip
                    labelFormatter={(label) => `Date: ${label}`}
                    formatter={(value, name) => {
                      const v = Number(value);
                      return [
                        name === "Revenue ($)" ? `$${v.toFixed(2)}` : v,
                        String(name),
                      ];
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="orders"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    name="Orders"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Order Distribution
            </h3>
            {statusDistribution.length > 0 ? (
              <>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {statusDistribution.map((s) => (
                    <div key={s.name} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.name}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Charts Row 2: Revenue by Product + Payment Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              Revenue by Product
            </h3>
            {byProduct.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byProduct} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      tick={{ fontSize: 11 }}
                      stroke="#9ca3af"
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        const v = Number(value);
                        return [
                          name === "Revenue ($)" ? `$${v.toFixed(2)}` : v,
                          String(name),
                        ];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#22c55e" name="Revenue ($)" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="orders" fill="#6366f1" name="Orders" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400 text-sm">
                No data yet
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Payment Distribution
            </h3>
            {paymentDistribution.length > 0 ? (
              <>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {paymentDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {paymentDistribution.map((s) => (
                    <div key={s.name} className="flex items-center gap-1.5 text-xs">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.name}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-52 flex items-center justify-center text-gray-400 text-sm">
                No data yet
              </div>
            )}
          </div>
        </div>

        {/* Product Breakdown Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-indigo-500" />
            Product Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">
                    Product
                  </th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">
                    Orders
                  </th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">
                    Revenue
                  </th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">
                    Pending
                  </th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">
                    Avg Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {byProduct.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-2 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-700">
                      {product.orders}
                    </td>
                    <td className="py-3 px-2 text-right text-green-600 font-medium">
                      ${product.revenue.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right text-amber-600">
                      {product.pending}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-700">
                      $
                      {product.orders > 0
                        ? (product.revenue / product.orders).toFixed(2)
                        : "0.00"}
                    </td>
                  </tr>
                ))}
                {byProduct.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-gray-400"
                    >
                      No data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Plan Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            Plan Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-2 text-gray-500 font-medium">
                    Plan
                  </th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">
                    Orders
                  </th>
                  <th className="text-right py-3 px-2 text-gray-500 font-medium">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {byPlan.map((plan) => (
                  <tr
                    key={plan.name}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-3 px-2 font-medium text-gray-900">
                      {plan.name}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-700">
                      {plan.orders}
                    </td>
                    <td className="py-3 px-2 text-right text-green-600 font-medium">
                      ${plan.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {byPlan.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-8 text-center text-gray-400"
                    >
                      No data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Top Customers
            </h3>
            {topCustomers.length > 0 ? (
              <div className="space-y-3">
                {topCustomers.map((customer, i) => (
                  <div
                    key={customer.whatsapp}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {customer.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {customer.orders} order{customer.orders > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600 text-sm">
                      ${customer.totalSpent.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8 text-sm">
                No customers yet
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Recent Orders
            </h3>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {order.product} - {order.plan}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.customer} &bull;{" "}
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">
                        ${order.price.toFixed(2)}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          order.paymentStatus === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : order.paymentStatus === "pending_confirmation"
                              ? "bg-amber-100 text-amber-700"
                              : order.paymentStatus === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {order.paymentStatus === "confirmed"
                          ? "Paid"
                          : order.paymentStatus === "pending_confirmation"
                            ? "Pending"
                            : order.paymentStatus === "rejected"
                              ? "Rejected"
                              : "Unpaid"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8 text-sm">
                No orders yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}

function StatusItem({
  icon: Icon,
  color,
  bg,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  label: string;
  value: number;
}) {
  return (
    <div className={`${bg} rounded-lg p-3 flex items-center gap-2`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <div>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
