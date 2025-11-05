import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface Product {
  id: number;
  product: string;
  subtitle: string;
  oldPrice: number;
  salePrice: number;
  rating: number;
  ratingCount: number;
  subcategory: string;
  imageUrls: string[];
  imagePublicIds: string[];
  name?: string;
  description?: string;
}

export default function ProductDetailCard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImg, setSelectedImg] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await apiService.getProductById(id);

        if (response.success && response.data) {
          const productData = response.data as { product: Product };
          setProduct(productData.product);

          // ✅ Always show the first image by default
          if (productData.product.imageUrls?.length > 0) {
            setSelectedImg(productData.product.imageUrls[0]);
          }
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("An error occurred while fetching product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!product) return;

    try {
      setAddingToCart(true);
      console.log("Adding to cart - productId:", product.id, "quantity:", quantity);
      const response = await apiService.addToCart(product.id.toString(), quantity);
      console.log("Add to cart response:", response);
      
      if (response.success) {
        // Show success message
        alert("Product added to cart successfully!");
        // Refresh cart count in header (will happen automatically via Header's useEffect)
        // Optionally navigate to cart
        // navigate("/cart");
      } else {
        const errorMsg = response.error || response.data?.message || "Failed to add product to cart";
        alert(errorMsg);
        console.error("Add to cart error:", response);
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("An error occurred while adding to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Product not found"}</p>
          <button
            onClick={() => navigate("/products")}
            className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const galleryImages =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : [selectedImg];

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "30px auto",
        padding: 24,
        background: "#FFF",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 36 }}>
        {/* Thumbnails & Main image */}
        <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {galleryImages.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Product view ${index + 1}`}
                style={{
                  width: 54,
                  height: 70,
                  objectFit: "cover",
                  cursor: "pointer",
                  border:
                    selectedImg === img
                      ? "2px solid #b91c1c"
                      : "1px solid #eee",
                  borderRadius: 5,
                }}
                onClick={() => setSelectedImg(img)}
              />
            ))}
          </div>

          <img
            src={selectedImg}
            alt="Main product"
            style={{
              width: 340,
              height: 420,
              objectFit: "cover",
              borderRadius: 8,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            }}
          />
        </div>

        {/* Product details */}
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 600,
              marginBottom: 8,
              color: "#1f2937",
            }}
          >
            {product.product} {product.subtitle}
          </h1>
          <p style={{ color: "#6b7280", marginBottom: 16 }}>
            {product.subtitle}
          </p>

          {/* Rating */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", gap: 2 }}>
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  style={{ color: i < product.rating ? "#fbbf24" : "#d1d5db" }}
                >
                  ★
                </span>
              ))}
            </div>
            <span style={{ color: "#6b7280", fontSize: 14 }}>
              ({product.ratingCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24, fontWeight: 600, color: "#1f2937" }}>
                ₹{product.salePrice}
              </span>
              {product.oldPrice && (
                <span
                  style={{
                    fontSize: 18,
                    color: "#6b7280",
                    textDecoration: "line-through",
                  }}
                >
                  ₹{product.oldPrice}
                </span>
              )}
            </div>
            {product.oldPrice && product.salePrice && (
              <p style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
                Save ₹{(product.oldPrice - product.salePrice).toLocaleString()}
              </p>
            )}
          </div>

          {/* ✅ Always show Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            style={{
              width: "100%",
              padding: "12px 24px",
              background: "#1f2937",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: 12,
              opacity: addingToCart ? 0.8 : 1,
            }}
          >
            {addingToCart ? "Adding to Cart..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
