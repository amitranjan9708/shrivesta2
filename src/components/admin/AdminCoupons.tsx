import React, { useEffect, useState } from "react";
import { apiService } from "../../services/api";

type Coupon = {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number | null;
  validFrom: string;
  validTo: string;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const defaultForm = {
  code: "",
  discountType: "PERCENT" as "PERCENT" | "FIXED",
  discountValue: "",
  minOrderAmount: "",
  validFrom: "",
  validTo: "",
  maxUses: "",
  active: true,
};

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await apiService.getCoupons();
      const data = (res.data as any)?.coupons ?? (res.data as any);
      if (Array.isArray(data)) setCoupons(data);
      else setError(res.error || "Failed to fetch coupons");
    } catch (e: any) {
      setError(e.message || "Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        validFrom: form.validFrom || undefined,
        validTo: form.validTo || undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
        active: form.active,
      };
      if (editingId) {
        await apiService.updateCoupon(editingId, payload);
        await fetchCoupons();
        resetForm();
      } else {
        await apiService.createCoupon(payload);
        await fetchCoupons();
        resetForm();
      }
    } catch (e: any) {
      setError(e.message || (e as any).error || "Failed to save coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      discountType: c.discountType as "PERCENT" | "FIXED",
      discountValue: String(c.discountValue),
      minOrderAmount: c.minOrderAmount != null ? String(c.minOrderAmount) : "",
      validFrom: c.validFrom ? c.validFrom.slice(0, 16) : "",
      validTo: c.validTo ? c.validTo.slice(0, 16) : "",
      maxUses: c.maxUses != null ? String(c.maxUses) : "",
      active: c.active,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this coupon? This cannot be undone.")) return;
    setDeleteId(id);
    try {
      const res = await apiService.deleteCoupon(id);
      if (res.success) await fetchCoupons();
      else setError(res.error || "Delete failed");
    } catch (e: any) {
      setError(e.message || "Delete failed");
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (s: string) => (s ? new Date(s).toLocaleString() : "—");
  const isExpired = (validTo: string) => new Date(validTo) < new Date();

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Coupons</h1>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {editingId ? "Edit Coupon" : "Add New Coupon"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border-2 border-gray-300 focus:border-amber-500 p-3 rounded-lg"
            placeholder="Code (e.g. SAVE10)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            required
            disabled={!!editingId}
          />
          <select
            className="border-2 border-gray-300 focus:border-amber-500 p-3 rounded-lg bg-white"
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value as "PERCENT" | "FIXED" })}
          >
            <option value="PERCENT">Percentage</option>
            <option value="FIXED">Fixed amount (₹)</option>
          </select>
          <input
            type="number"
            min={form.discountType === "PERCENT" ? 1 : 0}
            max={form.discountType === "PERCENT" ? 100 : undefined}
            className="border-2 border-gray-300 focus:border-amber-500 p-3 rounded-lg"
            placeholder={form.discountType === "PERCENT" ? "Percent (1-100)" : "Amount in ₹"}
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
            required
          />
          <input
            type="number"
            min="0"
            className="border-2 border-gray-300 focus:border-amber-500 p-3 rounded-lg"
            placeholder="Min order amount (optional)"
            value={form.minOrderAmount}
            onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
          />
          <input
            type="datetime-local"
            className="border-2 border-gray-300 focus:border-amber-500 p-3 rounded-lg"
            placeholder="Valid from"
            value={form.validFrom}
            onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
          />
          <input
            type="datetime-local"
            className="border-2 border-gray-300 focus:border-amber-500 p-3 rounded-lg"
            placeholder="Valid to"
            value={form.validTo}
            onChange={(e) => setForm({ ...form, validTo: e.target.value })}
          />
          <input
            type="number"
            min="1"
            className="border-2 border-gray-300 focus:border-amber-500 p-3 rounded-lg"
            placeholder="Max uses (optional)"
            value={form.maxUses}
            onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-amber-500 hover:bg-amber-600 text-black px-6 py-3 rounded-lg font-semibold disabled:opacity-60"
            >
              {submitting ? "Saving..." : editingId ? "Update" : "Add Coupon"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="border border-gray-400 px-6 py-3 rounded-lg">
                Cancel
              </button>
            )}
          </div>
        </form>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
          <p className="mt-4 text-gray-600">Loading coupons...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No coupons yet. Add one above.</p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Min order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Valid from</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Valid to</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Uses</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Active</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons.map((c) => (
                  <tr key={c.id} className={isExpired(c.validTo) ? "bg-gray-50" : ""}>
                    <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">{c.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.discountType}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {c.discountType === "PERCENT" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {c.minOrderAmount != null ? `₹${c.minOrderAmount.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(c.validFrom)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(c.validTo)}
                      {isExpired(c.validTo) && <span className="text-red-600 ml-1">(Expired)</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {c.usedCount}
                      {c.maxUses != null && ` / ${c.maxUses}`}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 text-xs rounded ${c.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}
                      >
                        {c.active ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(c)}
                        className="text-amber-600 hover:text-amber-700 mr-2 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deleteId === c.id}
                        className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        {deleteId === c.id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
