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
    if (!confirm("Delete this product?")) return;
    const res = await apiService.adminDeleteProduct(id);
    if (res.success) refresh();
    else alert(res.error || "Delete failed");
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Manage Products</h1>

      <form onSubmit={onSubmit} className="bg-white shadow rounded p-4 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="border p-2 rounded" placeholder="Product name" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} required />
        <input className="border p-2 rounded" placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} required />
        <input className="border p-2 rounded" placeholder="Old price" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} required />
        <input className="border p-2 rounded" placeholder="Sale price" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} required />
        <input className="border p-2 rounded" placeholder="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Rating count" value={form.ratingCount} onChange={(e) => setForm({ ...form, ratingCount: e.target.value })} />
        <input className="border p-2 rounded" placeholder="Subcategory" value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} required />
        <input className="border p-2 rounded" type="file" multiple accept="image/*" onChange={onFileChange} />
        <div className="md:col-span-2">
          <button disabled={submitting} className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded">
            {submitting ? "Adding..." : "Add Product"}
          </button>
          {error && <span className="text-red-600 ml-4">{error}</span>}
        </div>
      </form>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white shadow rounded p-4">
              {p.imageUrls?.[0] && (
                <img src={p.imageUrls[0]} alt={p.product} className="w-full h-40 object-cover rounded mb-2" />
              )}
              <div className="font-semibold">{p.product}</div>
              <div className="text-sm text-gray-500">{p.subtitle}</div>
              <div className="mt-2">₹{p.salePrice}</div>
              <button onClick={() => onDelete(p.id)} className="mt-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;


