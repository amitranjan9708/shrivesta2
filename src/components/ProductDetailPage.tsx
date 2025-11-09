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
        const errorMsg = response.error || (response.data as any)?.message || "Failed to add product to cart";
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
    <>
      <style>{`
        @media (max-width: 767px) {
          .product-detail-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 16px !important;
            background: #FFF;
          }
          .product-detail-content {
            flex-direction: column !important;
            gap: 20px !important;
          }
          .product-image-section {
            width: 100% !important;
            flex-direction: column !important;
            gap: 12px !important;
          }
          .product-thumbnails {
            display: flex !important;
            flex-direction: row !important;
            gap: 8px !important;
            overflow-x: auto !important;
            padding: 0 !important;
            order: 2 !important;
          }
          .product-thumbnails img {
            width: 50px !important;
            height: 60px !important;
            flex-shrink: 0 !important;
            border-radius: 4px !important;
          }
          .product-main-image {
            width: 100% !important;
            height: auto !important;
            max-height: 400px !important;
            object-fit: cover !important;
            border-radius: 4px !important;
            border: 1px solid #e5e7eb !important;
            order: 1 !important;
          }
          .product-details-section {
            padding: 0 !important;
            width: 100% !important;
          }
          .product-title {
            font-size: 20px !important;
            font-weight: 600 !important;
            line-height: 1.3 !important;
            margin-bottom: 8px !important;
            color: #1f2937 !important;
          }
          .product-subtitle {
            font-size: 14px !important;
            color: #6b7280 !important;
            margin-bottom: 12px !important;
            line-height: 1.5 !important;
          }
          .product-price-section {
            background: #ffffff !important;
            padding: 0 !important;
            margin-bottom: 16px !important;
            border: none !important;
          }
          .product-price-current {
            font-size: 24px !important;
            font-weight: 600 !important;
            color: #1f2937 !important;
            margin-bottom: 4px !important;
          }
          .product-price-old {
            font-size: 14px !important;
            color: #6b7280 !important;
            text-decoration: line-through !important;
            margin-right: 8px !important;
          }
          .product-save {
            font-size: 12px !important;
            font-weight: 500 !important;
            color: #059669 !important;
            margin-top: 4px !important;
          }
          .product-rating {
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            margin-bottom: 16px !important;
            padding: 0 !important;
            background: transparent !important;
            border-radius: 0 !important;
            width: fit-content !important;
          }
          .product-button {
            width: 100% !important;
            max-width: 100% !important;
            padding: 10px 20px !important;
            background: #f59e0b !important;
            color: white !important;
            border: none !important;
            border-radius: 4px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            cursor: pointer !important;
            box-shadow: none !important;
            transition: background 0.2s ease !important;
            text-transform: none !important;
            letter-spacing: 0 !important;
            margin-bottom: 12px !important;
          }
          .product-button:hover {
            background: #d97706 !important;
          }
          .product-button:disabled {
            opacity: 0.7 !important;
            cursor: not-allowed !important;
          }
        }
        @media (min-width: 768px) {
          .product-detail-container {
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
            background: #ffffff;
          }
          .product-detail-content {
            display: flex;
            align-items: flex-start;
            gap: 30px;
          }
          .product-image-section {
            display: flex;
            flex-direction: row;
            gap: 12px;
            flex: 0 0 400px;
          }
          .product-thumbnails {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .product-thumbnails img {
            width: 50px;
            height: 60px;
            object-fit: cover;
            border-radius: 4px;
            transition: all 0.2s ease;
            cursor: pointer;
          }
          .product-thumbnails img:hover {
            opacity: 0.8;
          }
          .product-main-image {
            width: 350px;
            height: 400px;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
          }
          .product-details-section {
            flex: 1;
            padding: 0;
          }
          .product-title {
            font-size: 24px;
            font-weight: 600;
            line-height: 1.3;
            margin-bottom: 8px;
            color: #1f2937;
          }
          .product-subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 12px;
            line-height: 1.5;
          }
          .product-price-section {
            background: #ffffff;
            padding: 0;
            margin-bottom: 16px;
            border: none;
          }
          .product-price-current {
            font-size: 28px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
          }
          .product-price-old {
            font-size: 16px;
            color: #6b7280;
            text-decoration: line-through;
            margin-right: 8px;
          }
          .product-save {
            font-size: 13px;
            font-weight: 500;
            color: #059669;
            margin-top: 4px;
          }
          .product-rating {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            padding: 0;
            background: transparent;
            border-radius: 0;
            width: fit-content;
          }
          .product-button {
            width: 100%;
            max-width: 300px;
            padding: 10px 20px;
            background: #f59e0b;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: none;
            transition: background 0.2s ease;
            text-transform: none;
            letter-spacing: 0;
            margin-bottom: 12px;
          }
          .product-button:hover {
            background: #d97706;
            transform: none;
            box-shadow: none;
          }
          .product-button:active {
            transform: none;
          }
          .product-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
        }
      `}</style>
      <div className="product-detail-container">
        <div className="product-detail-content">
          {/* Thumbnails & Main image */}
          <div className="product-image-section">
            <div className="product-thumbnails">
              {galleryImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Product view ${index + 1}`}
                  style={{
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
              className="product-main-image"
            />
          </div>

          {/* Product details */}
          <div className="product-details-section">
            <h1 className="product-title">
              {product.product}
            </h1>
            <p className="product-subtitle">
              {product.subtitle}
            </p>

            {/* Rating */}
            <div className="product-rating">
              <div style={{ display: "flex", gap: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    style={{ 
                      color: i < product.rating ? "#fbbf24" : "#d1d5db",
                      fontSize: "14px"
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span style={{ color: "#6b7280", fontSize: 13, fontWeight: 400 }}>
                ({product.ratingCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="product-price-section">
              <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", gap: "12px" }}>
                <span className="product-price-current">
                  ₹{product.salePrice.toLocaleString()}
                </span>
                {product.oldPrice && (
                  <span className="product-price-old">
                    ₹{product.oldPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {product.oldPrice && product.salePrice && (
                <div className="product-save">
                  You Save ₹{(product.oldPrice - product.salePrice).toLocaleString()} ({Math.round(((product.oldPrice - product.salePrice) / product.oldPrice) * 100)}% OFF)
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="product-button"
            >
            {addingToCart ? "Adding to Cart..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
