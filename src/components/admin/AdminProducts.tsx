import React, { useEffect, useState, useRef } from "react";
import { apiService } from "../../services/api";

type Product = {
  id: number;
  product: string;
  subtitle: string;
  salePrice: number;
  oldPrice: number;
  subcategory: string;
  imageUrls: string[];
};

// Labels for the 6 image upload slots
const IMAGE_SLOTS = [
  { key: "front", label: "Front View", required: true },
  { key: "left", label: "Left View", required: true },
  { key: "right", label: "Right View", required: true },
  { key: "back", label: "Back View", required: true },
  { key: "extra1", label: "Extra Photo 1", required: false },
  { key: "extra2", label: "Extra Photo 2", required: false },
] as const;

type SlotKey = (typeof IMAGE_SLOTS)[number]["key"];

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  // Separate state for image slots
  const [imageSlots, setImageSlots] = useState<Record<SlotKey, File | null>>({
    front: null,
    left: null,
    right: null,
    back: null,
    extra1: null,
    extra2: null,
  });

  // Preview URLs for selected images
  const [previews, setPreviews] = useState<Record<SlotKey, string | null>>({
    front: null,
    left: null,
    right: null,
    back: null,
    extra1: null,
    extra2: null,
  });

  // Refs for file inputs to reset them
  const fileInputRefs = useRef<Record<SlotKey, HTMLInputElement | null>>({
    front: null,
    left: null,
    right: null,
    back: null,
    extra1: null,
    extra2: null,
  });

  // Size options matching database enum (Size: S, M, L, XL, XXL, FREE)
  const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL", "FREE"];

  const toggleSize = (size: string) => {
    setForm((f) => ({
      ...f,
      availableSizes: f.availableSizes.includes(size)
        ? f.availableSizes.filter((s) => s !== size)
        : [...f.availableSizes, size],
    }));
  };

  // Available subcategories in the database
  const allSubcategories = [
    "2piece-kurti",
    "3piece-kurti",
    "short-kurti",
    "long-kurti"
  ];

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await apiService.adminGetProducts();
      const data = (res.data as any)?.products || (res.data as any)?.data?.products;
      if (res.success && data) setProducts(data);
      else setError(res.error || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // Handle file selection for a specific slot
  const onSlotFileChange = (slotKey: SlotKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageSlots((prev) => ({ ...prev, [slotKey]: file }));

    // Generate preview
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviews((prev) => {
        // Revoke old URL to prevent memory leaks
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

  // Remove image from a slot
  const removeSlotImage = (slotKey: SlotKey) => {
    setImageSlots((prev) => ({ ...prev, [slotKey]: null }));
    setPreviews((prev) => {
      if (prev[slotKey]) URL.revokeObjectURL(prev[slotKey]!);
      return { ...prev, [slotKey]: null };
    });
    // Reset the file input
    if (fileInputRefs.current[slotKey]) {
      fileInputRefs.current[slotKey]!.value = "";
    }
  };

  // Count how many required images are filled
  const requiredSlotsFilled = IMAGE_SLOTS.filter(
    (s) => s.required && imageSlots[s.key]
  ).length;
  const totalRequiredSlots = IMAGE_SLOTS.filter((s) => s.required).length;
  const allRequiredFilled = requiredSlotsFilled === totalRequiredSlots;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required images
    if (!allRequiredFilled) {
      setError("Please upload all 4 required images (Front, Left, Right, Back views)");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      // Build images array in order: front, left, right, back, extra1, extra2
      const orderedImages: File[] = [];
      for (const slot of IMAGE_SLOTS) {
        const file = imageSlots[slot.key];
        if (file) {
          orderedImages.push(file);
        }
      }

      const payload = {
        product: form.product,
        subtitle: form.subtitle,
        oldPrice: Number(form.oldPrice),
        salePrice: Number(form.salePrice),
        rating: Number(form.rating),
        ratingCount: Number(form.ratingCount),
        subcategory: form.subcategory,
        images: orderedImages,
        availableSizes: form.availableSizes,
      };
      const res = await apiService.adminCreateProduct(payload);
      if (res.success) {
        // Reset form
        setForm({ product: "", subtitle: "", oldPrice: "", salePrice: "", rating: "4", ratingCount: "0", subcategory: "", availableSizes: [] });
        // Reset all image slots
        const emptySlots: Record<SlotKey, null> = { front: null, left: null, right: null, back: null, extra1: null, extra2: null };
        setImageSlots(emptySlots);
        // Revoke all preview URLs
        Object.values(previews).forEach((url) => { if (url) URL.revokeObjectURL(url); });
        setPreviews({ front: null, left: null, right: null, back: null, extra1: null, extra2: null });
        // Reset file inputs
        Object.values(fileInputRefs.current).forEach((ref) => { if (ref) ref.value = ""; });
        await refresh();
      } else {
        setError(res.error || "Failed to create product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

    setDeletingId(id);
    try {
      const res = await apiService.adminDeleteProduct(id);
      if (res.success) {
        // Remove the product from the list immediately for better UX
        setProducts(products.filter(p => p.id !== id));
        // Refresh to ensure we have the latest data
        await refresh();
      } else {
        alert(res.error || "Delete failed");
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
      alert(error.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => { if (url) URL.revokeObjectURL(url); });
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Products</h1>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Product</h2>
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Product Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 rounded-lg transition-all"
              placeholder="Product name"
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
              required
            />
            <input
              className="border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 rounded-lg transition-all"
              placeholder="Subtitle"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              required
            />
            <input
              className="border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 rounded-lg transition-all"
              placeholder="Old price"
              type="number"
              value={form.oldPrice}
              onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
              required
            />
            <input
              className="border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 rounded-lg transition-all"
              placeholder="Sale price"
              type="number"
              value={form.salePrice}
              onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
              required
            />
            <input
              className="border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 rounded-lg transition-all"
              placeholder="Rating"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            />
            <input
              className="border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 rounded-lg transition-all"
              placeholder="Rating count"
              type="number"
              value={form.ratingCount}
              onChange={(e) => setForm({ ...form, ratingCount: e.target.value })}
            />
            <select
              className="border-2 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 p-3 rounded-lg transition-all bg-white"
              value={form.subcategory}
              onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
              required
            >
              <option value="">Select Subcategory</option>
              {allSubcategories.map((subcat) => (
                <option key={subcat} value={subcat}>
                  {subcat.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Size Selection */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Available sizes</p>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((size) => (
                <label
                  key={size}
                  className={`inline-flex items-center px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${form.availableSizes.includes(size)
                      ? "border-amber-500 bg-amber-50 text-amber-800"
                      : "border-gray-300 bg-white text-gray-600 hover:border-amber-300"
                    }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={form.availableSizes.includes(size)}
                    onChange={() => toggleSize(size)}
                  />
                  <span className="text-sm font-medium">{size}</span>
                </label>
              ))}
            </div>
            {form.availableSizes.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">Selected: {form.availableSizes.join(", ")}</p>
            )}
          </div>

          {/* Image Upload Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">
                Product Images
                <span className="text-gray-400 ml-2">
                  ({requiredSlotsFilled}/{totalRequiredSlots} required uploaded)
                </span>
              </p>
              {!allRequiredFilled && (
                <span className="text-xs text-red-500 font-medium">
                  * First 4 views are mandatory
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {IMAGE_SLOTS.map((slot) => (
                <div key={slot.key} className="flex flex-col items-center">
                  {/* Upload Box */}
                  <div
                    className={`relative w-full aspect-[3/4] rounded-lg border-2 border-dashed transition-all overflow-hidden group cursor-pointer ${imageSlots[slot.key]
                        ? "border-green-400 bg-green-50"
                        : slot.required
                          ? "border-amber-400 bg-amber-50/30 hover:border-amber-500 hover:bg-amber-50"
                          : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                      }`}
                    onClick={() => fileInputRefs.current[slot.key]?.click()}
                  >
                    {previews[slot.key] ? (
                      <>
                        <img
                          src={previews[slot.key]!}
                          alt={slot.label}
                          className="w-full h-full object-cover"
                        />
                        {/* Overlay on hover with remove button */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSlotImage(slot.key);
                            }}
                            className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-full font-medium hover:bg-red-600 transition-colors shadow-lg"
                          >
                            Remove
                          </button>
                        </div>
                        {/* Green check */}
                        <div className="absolute top-1.5 right-1.5 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-2 text-center">
                        <svg className={`w-8 h-8 mb-1.5 ${slot.required ? 'text-amber-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className={`text-xs font-medium ${slot.required ? 'text-amber-600' : 'text-gray-500'}`}>
                          Upload
                        </span>
                      </div>
                    )}

                    <input
                      ref={(el) => { fileInputRefs.current[slot.key] = el; }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onSlotFileChange(slot.key, e)}
                    />
                  </div>

                  {/* Label */}
                  <p className={`text-xs mt-1.5 text-center font-medium leading-tight ${slot.required ? 'text-gray-700' : 'text-gray-500'
                    }`}>
                    {slot.label}
                    {slot.required && <span className="text-red-500 ml-0.5">*</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4">
            <button
              disabled={submitting || !allRequiredFilled}
              className="bg-gradient-to-r from-amber-500 to-yellow-600 
hover:from-amber-600 hover:to-yellow-700 
text-black px-6 py-3 rounded-lg font-semibold text-lg 
shadow-md hover:shadow-lg transition-all duration-300 
transform hover:scale-105 cursor-pointer 
disabled:opacity-60 disabled:cursor-not-allowed
"
            >
              {submitting ? "Adding Product..." : "Add Product"}
            </button>
            {error && <span className="text-red-600 font-medium">{error}</span>}
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg">No products found. Add your first product above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
              {p.imageUrls?.[0] && (
                <img src={p.imageUrls[0]} alt={p.product} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <div className="font-bold text-lg text-gray-800 mb-1">{p.product}</div>
                <div className="text-sm text-gray-500 mb-2">{p.subtitle}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400">{p.imageUrls?.length || 0} images</span>
                </div>
                <div className="text-xl font-bold text-amber-600 mb-4">₹{p.salePrice}</div>
                <button
                  onClick={() => onDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 
hover:from-amber-600 hover:to-yellow-700 
text-black px-6 py-3 rounded-lg font-semibold text-lg 
shadow-md hover:shadow-lg transition-all duration-300 
transform hover:scale-105 cursor-pointer 
disabled:opacity-60 disabled:cursor-not-allowed
"
                >
                  {deletingId === p.id ? "Deleting..." : "Delete Product"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;


