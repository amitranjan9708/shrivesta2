import React, { useEffect, useState } from "react";
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
    images: [] as File[],
  });

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

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setForm((f) => ({ ...f, images: files }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        product: form.product,
        subtitle: form.subtitle,
        oldPrice: Number(form.oldPrice),
        salePrice: Number(form.salePrice),
        rating: Number(form.rating),
        ratingCount: Number(form.ratingCount),
        subcategory: form.subcategory,
        images: form.images,
      };
      const res = await apiService.adminCreateProduct(payload);
      if (res.success) {
        setForm({ product: "", subtitle: "", oldPrice: "", salePrice: "", rating: "4", ratingCount: "0", subcategory: "", images: [] });
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

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Manage Products</h1>

      <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Product</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div className="flex items-center">
            <label className="block w-full border-2 border-gray-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50 transition-all">
              <span className="text-gray-600 text-sm font-medium">Choose Images</span>
              <input 
                className="hidden" 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={onFileChange} 
              />
              {form.images.length > 0 && (
                <span className="ml-2 text-amber-600 text-sm">({form.images.length} file{form.images.length > 1 ? 's' : ''} selected)</span>
              )}
            </label>
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <button 
              disabled={submitting} 
              className=" bg-gradient-to-r from-amber-500 to-yellow-600 
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


