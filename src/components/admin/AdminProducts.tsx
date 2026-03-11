import React, { useEffect, useState, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { apiService } from "../../services/api";
import { X, Pencil, Trash2, Plus, Loader } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Product = {
  id: number;
  product: string;
  subtitle: string;
  salePrice: number;
  oldPrice: number;
  rating: number;
  ratingCount: number;
  subcategory: string;
  imageUrls: string[];
  imagePublicIds: string[];
  availableSizes: string[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_SLOTS = [
  { key: "front",  label: "Front View",   required: true  },
  { key: "left",   label: "Left View",    required: true  },
  { key: "right",  label: "Right View",   required: true  },
  { key: "back",   label: "Back View",    required: true  },
  { key: "extra1", label: "Extra Photo 1", required: false },
  { key: "extra2", label: "Extra Photo 2", required: false },
] as const;
type SlotKey = (typeof IMAGE_SLOTS)[number]["key"];

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL", "FREE"];

const ALL_SUBCATEGORIES = [
  "2piece-kurti",
  "3piece-kurti",
  "short-kurti",
  "long-kurti",
];

const emptySlots = () =>
  ({ front: null, left: null, right: null, back: null, extra1: null, extra2: null } as Record<SlotKey, File | null>);
const emptyPreviews = () =>
  ({ front: null, left: null, right: null, back: null, extra1: null, extra2: null } as Record<SlotKey, string | null>);

// ─── EditProductModal ─────────────────────────────────────────────────────────

type EditModalProps = {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
};

const EditProductModal: React.FC<EditModalProps> = ({ product, onClose, onSaved }) => {
  const [form, setForm] = useState({
    product:     product.product,
    subtitle:    product.subtitle,
    oldPrice:    String(product.oldPrice),
    salePrice:   String(product.salePrice),
    rating:      String(product.rating),
    ratingCount: String(product.ratingCount),
    subcategory: product.subcategory,
    availableSizes: product.availableSizes || ([] as string[]),
  });

  // Existing images the user wants to keep (starts as all existing)
  const [keptUrls, setKeptUrls] = useState<string[]>(product.imageUrls || []);

  // New images to add (simple list, not slot-based since we're editing)
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const newFileInputRef = useRef<HTMLInputElement | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const totalImages = keptUrls.length + newFiles.length;
  const canAddMore = totalImages < 6;

  const toggleSize = (size: string) =>
    setForm((f) => ({
      ...f,
      availableSizes: f.availableSizes.includes(size)
        ? f.availableSizes.filter((s) => s !== size)
        : [...f.availableSizes, size],
    }));

  const removeExisting = (url: string) => setKeptUrls((prev) => prev.filter((u) => u !== url));

  const onNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []) as File[];
    const allowed = picked.slice(0, 6 - totalImages);
    setNewFiles((prev) => [...prev, ...allowed]);
    setNewPreviews((prev) => [...prev, ...allowed.map((f) => URL.createObjectURL(f))]);
    if (newFileInputRef.current) newFileInputRef.current.value = "";
  };

  const removeNewFile = (idx: number) => {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (keptUrls.length + newFiles.length === 0) {
      setError("At least one image is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await apiService.adminUpdateProduct(product.id, {
        product:       form.product,
        subtitle:      form.subtitle,
        oldPrice:      Number(form.oldPrice),
        salePrice:     Number(form.salePrice),
        rating:        Number(form.rating),
        ratingCount:   Number(form.ratingCount),
        subcategory:   form.subcategory,
        availableSizes: form.availableSizes,
        keepImageUrls:  keptUrls,
        newImages:      newFiles,
      });
      if (res.success) {
        newPreviews.forEach((url) => URL.revokeObjectURL(url));
        onSaved();
      } else {
        setError((res as any).error || "Failed to update product");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  // Lock body scroll without jumping to top
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  // Cleanup previews on unmount
  useEffect(() => () => { newPreviews.forEach((u) => URL.revokeObjectURL(u)); }, []);

  return (
    ReactDOM.createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.5)", padding: "1rem" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ position: "relative", width: "100%", maxWidth: "48rem", maxHeight: "90vh", overflowY: "auto", backgroundColor: "#fff", borderRadius: "1rem", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Product</h2>
            <p className="text-xs text-gray-400 mt-0.5">ID #{product.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="px-6 py-6 space-y-6">

          {/* Basic Info */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Basic Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Product Name *</label>
                <input
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
                  value={form.product}
                  onChange={(e) => setForm({ ...form, product: e.target.value })}
                  placeholder="Product name"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Subtitle *</label>
                <input
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Old Price (₹) *</label>
                <input
                  required type="number" min="0" step="0.01"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
                  value={form.oldPrice}
                  onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Sale Price (₹) *</label>
                <input
                  required type="number" min="0" step="0.01"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Rating</label>
                <input
                  type="number" step="0.1" min="0" max="5"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Rating Count</label>
                <input
                  type="number" min="0"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
                  value={form.ratingCount}
                  onChange={(e) => setForm({ ...form, ratingCount: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Subcategory *</label>
                <select
                  required
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm"
                  value={form.subcategory}
                  onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                >
                  <option value="">Select subcategory</option>
                  {ALL_SUBCATEGORIES.map((s) => (
                    <option key={s} value={s}>{s.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Available Sizes</h3>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((size) => (
                <label
                  key={size}
                  className={`inline-flex items-center px-4 py-2 rounded-xl border-2 cursor-pointer transition-all text-sm font-semibold select-none ${
                    form.availableSizes.includes(size)
                      ? "border-amber-500 bg-amber-50 text-amber-800"
                      : "border-gray-200 bg-white text-gray-500 hover:border-amber-300"
                  }`}
                >
                  <input type="checkbox" className="sr-only" checked={form.availableSizes.includes(size)} onChange={() => toggleSize(size)} />
                  {size}
                </label>
              ))}
            </div>
            {form.availableSizes.length > 0 && (
              <p className="text-xs text-gray-400 mt-2">Selected: {form.availableSizes.join(", ")}</p>
            )}
          </div>

          {/* Images */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Images ({totalImages}/6)
            </h3>

            {/* Existing images */}
            {keptUrls.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2">Current images — click × to remove</p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {keptUrls.map((url, i) => (
                    <div key={url} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-green-300 bg-green-50">
                      <img src={url} alt={`img-${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExisting(url)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-green-500/80 text-white text-[9px] text-center py-0.5 font-semibold">
                        {["Front", "Left", "Right", "Back", "Extra 1", "Extra 2"][i] || `#${i + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New image upload */}
            {canAddMore && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Add new images ({6 - totalImages} slots remaining)</p>
                <div className="flex flex-wrap gap-3">
                  {newPreviews.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square w-20 rounded-xl overflow-hidden border-2 border-blue-300 bg-blue-50">
                      <img src={url} alt={`new-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewFile(idx)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => newFileInputRef.current?.click()}
                    className="aspect-square w-20 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50 hover:bg-amber-100 flex flex-col items-center justify-center gap-1 transition-colors text-amber-600"
                  >
                    <Plus className="h-5 w-5" />
                    <span className="text-[10px] font-semibold">Add</span>
                  </button>
                  <input
                    ref={newFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onNewFileChange}
                  />
                </div>
              </div>
            )}

            {totalImages === 0 && (
              <p className="text-xs text-red-500 mt-1">At least one image is required.</p>
            )}
          </div>

          {/* Footer */}
          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm px-6 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              {saving && <Loader className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-800 bg-white border border-gray-200 px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
    )
  );
};

// ─── AdminProducts ─────────────────────────────────────────────────────────────

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    product: "",
    subtitle: "",
    oldPrice: "",
    salePrice: "",
    rating: "4",
    ratingCount: "0",
    subcategory: "",
    availableSizes: [] as string[],
  });

  const [imageSlots, setImageSlots] = useState<Record<SlotKey, File | null>>(emptySlots());
  const [previews, setPreviews] = useState<Record<SlotKey, string | null>>(emptyPreviews());
  const fileInputRefs = useRef<Record<SlotKey, HTMLInputElement | null>>({
    front: null, left: null, right: null, back: null, extra1: null, extra2: null,
  });

  const requiredSlotsFilled = IMAGE_SLOTS.filter((s) => s.required && imageSlots[s.key]).length;
  const totalRequiredSlots  = IMAGE_SLOTS.filter((s) => s.required).length;
  const allRequiredFilled   = requiredSlotsFilled === totalRequiredSlots;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.adminGetProducts();
      const data = (res.data as any)?.products || (res.data as any)?.data?.products;
      if (res.success && data) setProducts(data);
      else setError(res.error || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => () => {
    (Object.values(previews) as (string | null)[]).forEach((url) => { if (url) URL.revokeObjectURL(url); });
  }, []);

  const toggleSize = (size: string) =>
    setForm((f) => ({
      ...f,
      availableSizes: f.availableSizes.includes(size)
        ? f.availableSizes.filter((s) => s !== size)
        : [...f.availableSizes, size],
    }));

  const onSlotFileChange = (slotKey: SlotKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageSlots((prev) => ({ ...prev, [slotKey]: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => {
        if (prev[slotKey]) URL.revokeObjectURL(prev[slotKey]!);
        return { ...prev, [slotKey]: url };
      });
    } else {
      setPreviews((prev) => {
        if (prev[slotKey]) URL.revokeObjectURL(prev[slotKey]!);
        return { ...prev, [slotKey]: null };
      });
    }
  };

  const removeSlotImage = (slotKey: SlotKey) => {
    setImageSlots((prev) => ({ ...prev, [slotKey]: null }));
    setPreviews((prev) => {
      if (prev[slotKey]) URL.revokeObjectURL(prev[slotKey]!);
      return { ...prev, [slotKey]: null };
    });
    if (fileInputRefs.current[slotKey]) fileInputRefs.current[slotKey]!.value = "";
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRequiredFilled) {
      setError("Please upload all 4 required images (Front, Left, Right, Back views)");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const orderedImages: File[] = [];
      for (const slot of IMAGE_SLOTS) {
        const file = imageSlots[slot.key];
        if (file) orderedImages.push(file);
      }
      const payload = {
        product:       form.product,
        subtitle:      form.subtitle,
        oldPrice:      Number(form.oldPrice),
        salePrice:     Number(form.salePrice),
        rating:        Number(form.rating),
        ratingCount:   Number(form.ratingCount),
        subcategory:   form.subcategory,
        images:        orderedImages,
        availableSizes: form.availableSizes,
      };
      const res = await apiService.adminCreateProduct(payload);
      if (res.success) {
        setForm({ product: "", subtitle: "", oldPrice: "", salePrice: "", rating: "4", ratingCount: "0", subcategory: "", availableSizes: [] });
        setImageSlots(emptySlots());
        (Object.values(previews) as (string | null)[]).forEach((url) => { if (url) URL.revokeObjectURL(url); });
        setPreviews(emptyPreviews());
        (Object.values(fileInputRefs.current) as (HTMLInputElement | null)[]).forEach((ref) => { if (ref) ref.value = ""; });
        await refresh();
      } else {
        setError(res.error || "Failed to create product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await apiService.adminDeleteProduct(id);
      if (res.success) await refresh();
      else alert(res.error || "Delete failed");
    } catch (err: any) {
      alert(err.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 bg-gray-50 min-h-screen">

      {/* Edit modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={async () => { setEditingProduct(null); await refresh(); }}
        />
      )}

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Manage Products</h1>

      {/* ── Add New Product ── */}
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Product</h2>
        <form onSubmit={onSubmit} className="space-y-6">

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 rounded-lg transition-all" placeholder="Product name" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} required />
            <input className="border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 rounded-lg transition-all" placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} required />
            <input className="border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 rounded-lg transition-all" placeholder="Old price" type="number" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} required />
            <input className="border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 rounded-lg transition-all" placeholder="Sale price" type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} required />
            <input className="border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 rounded-lg transition-all" placeholder="Rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
            <input className="border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 rounded-lg transition-all" placeholder="Rating count" type="number" value={form.ratingCount} onChange={(e) => setForm({ ...form, ratingCount: e.target.value })} />
            <select className="border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 rounded-lg transition-all bg-white" value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} required>
              <option value="">Select Subcategory</option>
              {ALL_SUBCATEGORIES.map((s) => <option key={s} value={s}>{s.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</option>)}
            </select>
          </div>

          {/* Sizes */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Available sizes</p>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((size) => (
                <label key={size} className={`inline-flex items-center px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${form.availableSizes.includes(size) ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-300 bg-white text-gray-600 hover:border-amber-300"}`}>
                  <input type="checkbox" className="sr-only" checked={form.availableSizes.includes(size)} onChange={() => toggleSize(size)} />
                  <span className="text-sm font-medium">{size}</span>
                </label>
              ))}
            </div>
            {form.availableSizes.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">Selected: {form.availableSizes.join(", ")}</p>
            )}
          </div>

          {/* Image Slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">
                Product Images
                <span className="text-gray-400 ml-2">({requiredSlotsFilled}/{totalRequiredSlots} required uploaded)</span>
              </p>
              {!allRequiredFilled && <span className="text-xs text-red-500 font-medium">* First 4 views are mandatory</span>}
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {IMAGE_SLOTS.map((slot) => (
                <div key={slot.key} className="flex flex-col items-center">
                  <div
                    className={`relative w-full aspect-square rounded-lg border-2 border-dashed transition-all overflow-hidden group cursor-pointer ${imageSlots[slot.key] ? "border-green-400 bg-green-50" : slot.required ? "border-amber-400 bg-amber-50/30 hover:border-amber-500 hover:bg-amber-50" : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"}`}
                    onClick={() => fileInputRefs.current[slot.key]?.click()}
                  >
                    {previews[slot.key] ? (
                      <>
                        <img src={previews[slot.key]!} alt={slot.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={(e) => { e.stopPropagation(); removeSlotImage(slot.key); }} className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium hover:bg-red-600 shadow-lg">Remove</button>
                        </div>
                        <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-1 text-center">
                        <svg className={`w-5 h-5 mb-0.5 ${slot.required ? "text-amber-400" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        <span className={`text-[9px] font-medium ${slot.required ? "text-amber-600" : "text-gray-500"}`}>Upload</span>
                      </div>
                    )}
                    <input ref={(el) => { fileInputRefs.current[slot.key] = el; }} type="file" accept="image/*" className="hidden" onChange={(e) => onSlotFileChange(slot.key, e)} />
                  </div>
                  <p className={`text-[10px] mt-1 text-center font-medium leading-tight ${slot.required ? "text-gray-700" : "text-gray-500"}`}>
                    {slot.label}{slot.required && <span className="text-red-500 ml-0.5">*</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4">
            <button
              disabled={submitting || !allRequiredFilled}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black px-6 py-3 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Adding Product..." : "Add Product"}
            </button>
            {error && <span className="text-red-600 font-medium">{error}</span>}
          </div>
        </form>
      </div>

      {/* ── Product Grid ── */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader className="h-10 w-10 animate-spin text-amber-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-400 shadow-sm">
          No products yet. Add your first product above.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              {/* Image */}
              <div className="relative bg-gray-100" style={{ height: 360 }}>
                {p.imageUrls?.[0] ? (
                  <img src={p.imageUrls[0]} alt={p.product} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No image</div>
                )}
                {/* Image count badge */}
                <span style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999 }}>
                  {p.imageUrls?.length || 0} photos
                </span>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1 gap-1" style={{ position: "relative", zIndex: 1 }}>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{p.subcategory.replace(/-/g, " ")}</p>
                <h3 className="font-bold text-gray-900 text-sm leading-snug">{p.product}</h3>
                <p className="text-xs text-gray-400 leading-snug">{p.subtitle}</p>

                {/* Sizes */}
                {p.availableSizes?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.availableSizes.map((s) => (
                      <span key={s} className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-auto pt-3">
                  <span className="text-base font-bold text-amber-600">₹{p.salePrice}</span>
                  {p.oldPrice > p.salePrice && (
                    <span className="text-xs text-gray-400 line-through">₹{p.oldPrice}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setEditingProduct(p)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-amber-50 hover:text-amber-700 text-gray-700 text-xs font-semibold py-2 rounded-xl transition-colors border border-gray-200"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold py-2 rounded-xl transition-colors border border-red-100 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deletingId === p.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
