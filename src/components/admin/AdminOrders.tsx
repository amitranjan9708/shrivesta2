import React, { useEffect, useState, useCallback } from "react";
import { apiService } from "../../services/api";
import { Search, ChevronDown, ChevronUp, Loader, Package, Truck, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliveryStatus = "ORDERED" | "PACKED" | "SHIPPED" | "IN_TRANSIT" | "OUT_FOR_DELIVERY" | "DELIVERED" | "RETURNED";
type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "CANCELLED" | "COMPLETED";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  size?: string;
  product: { id: number; product: string; subtitle: string; imageUrls: string[]; salePrice: number };
}

interface DeliveryTracking {
  id: number;
  status: DeliveryStatus;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  courierPartner?: string;
  awbNumber?: string;
  trackingUrl?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  pincode: string;
  couponCode?: string;
  discountAmount?: number;
  createdAt: string;
  user: { id: number; name: string; email: string };
  items: OrderItem[];
  payment?: { status: string; paymentIntentId: string; amount: number };
  deliveryTracking?: DeliveryTracking;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ORDER_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "CANCELLED", "COMPLETED"];
const DELIVERY_STATUSES: DeliveryStatus[] = ["ORDERED", "PACKED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"];

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-green-100 text-green-800",
};

const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  ORDERED: "bg-gray-100 text-gray-700",
  PACKED: "bg-yellow-100 text-yellow-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  IN_TRANSIT: "bg-indigo-100 text-indigo-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  RETURNED: "bg-red-100 text-red-700",
};

// ─── Order Row (unified form) ─────────────────────────────────────────────────

function OrderRow({ order, onUpdated }: { order: Order; onUpdated: () => void }) {
  const [expanded, setExpanded] = useState(false);

  // Order status
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(order.status);

  // Delivery fields
  const tr = order.deliveryTracking;
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>(tr?.status || "ORDERED");
  const [courierPartner, setCourierPartner] = useState(tr?.courierPartner || "");
  const [awbNumber, setAwbNumber] = useState(tr?.awbNumber || "");
  const [trackingUrl, setTrackingUrl] = useState(tr?.trackingUrl || "");
  const [expectedDelivery, setExpectedDelivery] = useState(
    tr?.expectedDeliveryDate ? tr.expectedDeliveryDate.slice(0, 10) : ""
  );

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // Sync all fields when order data refreshes after save
  useEffect(() => {
    setOrderStatus(order.status);
    const t = order.deliveryTracking;
    setDeliveryStatus(t?.status || "ORDERED");
    setCourierPartner(t?.courierPartner || "");
    setAwbNumber(t?.awbNumber || "");
    setTrackingUrl(t?.trackingUrl || "");
    setExpectedDelivery(t?.expectedDeliveryDate ? t.expectedDeliveryDate.slice(0, 10) : "");
  }, [order]);

  const handleSaveAll = async () => {
    setSaving(true);
    setMsg(null);
    try {
      // Send all delivery fields in one call
      const deliveryPayload = {
        status: deliveryStatus,
        courierPartner: courierPartner.trim(),
        awbNumber: awbNumber.trim(),
        trackingUrl: trackingUrl.trim(),
        expectedDeliveryDate: expectedDelivery || undefined,
      };
      console.log("Delivery payload:", deliveryPayload);

      const deliveryRes = await apiService.adminUpdateOrderDelivery(order.id, deliveryPayload);

      if (!deliveryRes.success) {
        const err = (deliveryRes as any).error || (deliveryRes as any).message || "Failed to save delivery info";
        setMsg({ type: "err", text: err });
        return;
      }

      // Update order status only if it changed
      if (orderStatus !== order.status) {
        const statusRes = await apiService.adminUpdateOrderStatus(order.id, orderStatus);
        if (!statusRes.success) {
          const err = (statusRes as any).error || (statusRes as any).message || "Failed to update order status";
          setMsg({ type: "err", text: err });
          return;
        }
      }

      setMsg({ type: "ok", text: "Saved successfully" });
      onUpdated();
    } catch (e: any) {
      setMsg({ type: "err", text: e.message || "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <>
      {/* Summary row */}
      <tr
        className="cursor-pointer hover:bg-amber-50 transition-colors border-b border-gray-100"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="px-4 py-3 text-sm font-bold text-gray-900 font-mono whitespace-nowrap">#{order.orderNumber}</td>
        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{fmt(order.createdAt)}</td>
        <td className="px-4 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">{order.user.name}</td>
        <td className="px-4 py-3 text-sm text-gray-500 max-w-[180px]">
          <span className="block truncate">{order.user.email}</span>
        </td>
        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right whitespace-nowrap">₹{order.totalAmount.toFixed(2)}</td>
        <td className="px-4 py-3 text-center">
          <span className="text-xs font-medium text-gray-500 uppercase">{order.paymentMethod}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${ORDER_STATUS_COLORS[order.status]}`}>
            {order.status}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
            order.deliveryTracking
              ? DELIVERY_STATUS_COLORS[order.deliveryTracking.status]
              : "bg-gray-100 text-gray-400"
          }`}>
            {order.deliveryTracking ? order.deliveryTracking.status.replace(/_/g, " ") : "—"}
          </span>
        </td>
        <td className="px-4 py-3 text-center text-gray-400">
          {expanded ? <ChevronUp className="h-4 w-4 mx-auto" /> : <ChevronDown className="h-4 w-4 mx-auto" />}
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr>
          <td colSpan={9} className="p-0">
            <div className="border-t border-amber-100 p-4 space-y-5 bg-gray-50">

          {/* Items */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Items ({order.items.length})</h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-2 border border-gray-100">
                  {item.product.imageUrls?.[0] && (
                    <img src={item.product.imageUrls[0]} alt={item.product.product} className="h-12 w-10 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.product.product}</p>
                    <p className="text-xs text-gray-500">
                      {item.product.subtitle}{item.size ? ` • Size: ${item.size}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">₹{item.price.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">× {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address + Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Shipping Address</h4>
              <p className="text-sm text-gray-700 whitespace-pre-line">{order.shippingAddress}</p>
              <p className="text-sm text-gray-500 mt-1">PIN: {order.pincode}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Payment</h4>
              <p className="text-sm text-gray-700">
                Method: <span className="font-medium uppercase">{order.paymentMethod}</span>
              </p>
              {order.payment && (
                <p className="text-sm text-gray-700">
                  Status: <span className="font-medium">{order.payment.status}</span>
                </p>
              )}
              {order.payment?.paymentIntentId && (
                <p className="text-xs text-gray-400 mt-1 break-all">ID: {order.payment.paymentIntentId}</p>
              )}
              {order.couponCode && (
                <p className="text-sm text-green-700 mt-1">
                  Coupon: {order.couponCode} (−₹{order.discountAmount?.toFixed(2)})
                </p>
              )}
            </div>
          </div>

          {/* ── Unified Edit Form ── */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-4">
            <h4 className="font-semibold text-blue-900 text-sm">Update Order</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Order Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Order Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                  disabled={saving}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                >
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Delivery Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Delivery Status</label>
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}
                  disabled={saving}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                >
                  {DELIVERY_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
              </div>

              {/* Courier Partner */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Courier Partner</label>
                <input
                  type="text"
                  value={courierPartner}
                  onChange={(e) => setCourierPartner(e.target.value)}
                  placeholder="e.g. Delhivery, BlueDart"
                  disabled={saving}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                />
              </div>

              {/* AWB Number */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">AWB / Tracking No.</label>
                <input
                  type="text"
                  value={awbNumber}
                  onChange={(e) => setAwbNumber(e.target.value)}
                  placeholder="Airway bill number"
                  disabled={saving}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                />
              </div>

              {/* Expected Delivery Date */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  disabled={saving}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                />
              </div>

              {/* Tracking URL */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tracking URL</label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://..."
                  disabled={saving}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Save button */}
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={(e) => { e.stopPropagation(); handleSaveAll(); }}
                disabled={saving}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm px-5 py-2 rounded-lg font-semibold transition-colors"
              >
                {saving && <Loader className="h-4 w-4 animate-spin" />}
                Save All Changes
              </button>
              {msg && (
                <span className={`text-xs font-medium ${msg.type === "ok" ? "text-green-600" : "text-red-600"}`}>
                  {msg.text}
                </span>
              )}
            </div>
          </div>

          </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const LIMIT = 15;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiService.adminGetAllOrders({ status: statusFilter, search, page, limit: LIMIT });
      if (res.success && res.data) {
        const d = res.data as any;
        setOrders(d.orders || []);
        setPagination(d.pagination || { total: 0, totalPages: 1 });
      } else {
        setError(res.error || "Failed to fetch orders");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const counts = orders.reduce(
    (acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; },
    {} as Record<string, number>
  );

  const statusIcons: Record<string, React.ReactNode> = {
    ALL: <Package className="h-4 w-4" />,
    PENDING: <Clock className="h-4 w-4" />,
    CONFIRMED: <CheckCircle className="h-4 w-4" />,
    PROCESSING: <RefreshCw className="h-4 w-4" />,
    COMPLETED: <Truck className="h-4 w-4" />,
    CANCELLED: <XCircle className="h-4 w-4" />,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.total} total orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 text-sm bg-white border border-gray-200 hover:border-amber-400 hover:text-amber-600 text-gray-600 font-medium px-4 py-2 rounded-xl shadow-sm transition-colors"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* ── Stats bar ── */}
      <div className="flex flex-row items-stretch gap-3 mb-8 overflow-x-auto pb-1">
        {["ALL", ...ORDER_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`flex flex-col items-center justify-center gap-1.5 px-6 py-4 rounded-2xl border-2 flex-1 min-w-[100px] transition-all shadow-sm ${
              statusFilter === s
                ? "border-amber-500 bg-amber-50 shadow-amber-100"
                : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/40"
            }`}
          >
            <span className={statusFilter === s ? "text-amber-500" : "text-gray-400"}>{statusIcons[s]}</span>
            <span className="text-2xl font-bold text-gray-900">
              {s === "ALL" ? pagination.total : (counts[s] || 0)}
            </span>
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">{s}</span>
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order #, customer name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => { setSearch(searchInput); setPage(1); }}
          className="bg-amber-500 hover:bg-amber-600 text-black text-sm px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-colors"
        >
          Search
        </button>
        {search && (
          <button
            onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
            className="text-sm text-gray-500 hover:text-gray-800 bg-white border border-gray-200 px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Orders table ── */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader className="h-10 w-10 animate-spin text-amber-500" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-700 text-sm">{error}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-500 shadow-sm">
          No orders found{statusFilter !== "ALL" ? ` with status "${statusFilter}"` : ""}
          {search ? ` matching "${search}"` : ""}.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto shadow-sm">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-gray-200">
                {[
                  { label: "Order #",       align: "text-left"   },
                  { label: "Date",          align: "text-left"   },
                  { label: "Customer",      align: "text-left"   },
                  { label: "Email",         align: "text-left"   },
                  { label: "Amount",        align: "text-right"  },
                  { label: "Payment",       align: "text-center" },
                  { label: "Order Status",  align: "text-center" },
                  { label: "Delivery",      align: "text-center" },
                  { label: "",              align: "text-center" },
                ].map(({ label, align }) => (
                  <th key={label} className={`px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider ${align}`}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <OrderRow key={order.id} order={order} onUpdated={fetchOrders} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium disabled:opacity-40 hover:bg-gray-50 shadow-sm transition-colors"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600 bg-white border border-gray-200 px-5 py-2 rounded-xl shadow-sm">
            Page <strong>{page}</strong> of <strong>{pagination.totalPages}</strong>
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="px-5 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium disabled:opacity-40 hover:bg-gray-50 shadow-sm transition-colors"
          >
            Next →
          </button>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;
