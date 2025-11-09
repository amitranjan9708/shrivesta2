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

interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
  };
}

export default function ProductDetailCard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImg, setSelectedImg] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [totalReviewCount, setTotalReviewCount] = useState(0);

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

  // Fetch reviews when product loads
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      try {
        setLoadingReviews(true);
        const response = await apiService.getProductReviews(id);
        if (response.success && response.data) {
          const reviewsData = response.data as { reviews: Review[]; count: number };
          const allReviews = reviewsData.reviews || [];
          setTotalReviewCount(reviewsData.count || allReviews.length);
          
          // Check if user has already reviewed (if authenticated)
          if (isAuthenticated && user) {
            const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
            const userReviewData = allReviews.find((r: Review) => r.userId === userId);
            if (userReviewData) {
              setUserReview(userReviewData);
              // Filter out user's review from main list to avoid duplication
              const otherReviews = allReviews.filter((r: Review) => r.userId !== userId);
              setReviews(otherReviews);
            } else {
              setUserReview(null);
              setReviews(allReviews);
            }
          } else {
            setUserReview(null);
            setReviews(allReviews);
          }
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoadingReviews(false);
      }
    };

    if (product) {
      fetchReviews();
    }
  }, [id, product, isAuthenticated]);

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

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!id || !product) return;

    try {
      setSubmittingReview(true);
      const response = await apiService.createReview(
        id,
        reviewRating,
        reviewComment.trim() || undefined
      );

      console.log("Review submission response:", response);

      if (response.success && response.data) {
        // Check if response.data has review property
        const reviewData = response.data as { review?: Review; message?: string };
        if (reviewData.review) {
          setUserReview(reviewData.review);
          // Don't add user's review to main list - it's shown separately
          setShowReviewForm(false);
          setReviewComment("");
          setReviewRating(5);
          
          // Refresh product and reviews to get updated rating and all reviews
          const productResponse = await apiService.getProductById(id);
          if (productResponse.success && productResponse.data) {
            const productData = productResponse.data as { product: Product };
            setProduct(productData.product);
          }
          
          // Refresh reviews list
          const reviewsResponse = await apiService.getProductReviews(id);
          if (reviewsResponse.success && reviewsResponse.data) {
            const reviewsData = reviewsResponse.data as { reviews: Review[]; count: number };
            const allReviews = reviewsData.reviews || [];
            setTotalReviewCount(reviewsData.count || allReviews.length);
            
            if (user) {
              const userId = typeof user.id === 'string' ? parseInt(user.id) : user.id;
              const otherReviews = allReviews.filter((r: Review) => r.userId !== userId);
              setReviews(otherReviews);
            } else {
              setReviews(allReviews);
            }
          }
          
          alert("Review submitted successfully!");
        } else {
          console.error("Review data missing from response:", response);
          alert("Review submitted but response format was unexpected. Please refresh the page.");
        }
      } else {
        alert(response.error || "Failed to submit review");
      }
    } catch (err: any) {
      console.error("Error submitting review:", err);
      alert(err.message || "An error occurred while submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          .product-additional-sections {
            padding: 0 16px !important;
            margin-top: 30px !important;
          }
          .product-section-card {
            padding: 16px !important;
            margin-bottom: 20px !important;
          }
        }
        @media (min-width: 768px) {
          .product-detail-container {
            max-width: 1200px;
            margin: 20px auto;
            padding: 30px;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .product-detail-content {
            display: flex;
            align-items: flex-start;
            gap: 40px;
          }
          .product-image-section {
            display: flex;
            flex-direction: row;
            gap: 16px;
            flex: 0 0 420px;
          }
          .product-thumbnails {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .product-thumbnails img {
            width: 60px;
            height: 75px;
            object-fit: cover;
            border-radius: 6px;
            transition: all 0.2s ease;
            cursor: pointer;
            border: 2px solid transparent;
          }
          .product-thumbnails img:hover {
            border-color: #f59e0b;
            transform: scale(1.05);
          }
          .product-main-image {
            width: 380px;
            height: 450px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .product-details-section {
            flex: 1;
            padding: 0;
          }
          .product-title {
            font-size: 26px;
            font-weight: 600;
            line-height: 1.4;
            margin-bottom: 10px;
            color: #111827;
            letter-spacing: -0.02em;
          }
          .product-subtitle {
            font-size: 15px;
            color: #6b7280;
            margin-bottom: 16px;
            line-height: 1.6;
          }
          .product-price-section {
            background: linear-gradient(to right, #fef3c7, #fde68a);
            padding: 16px 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            border: 1px solid #fbbf24;
          }
          .product-price-current {
            font-size: 32px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 6px;
            letter-spacing: -0.02em;
          }
          .product-price-old {
            font-size: 18px;
            color: #6b7280;
            text-decoration: line-through;
            margin-right: 10px;
          }
          .product-save {
            font-size: 14px;
            font-weight: 600;
            color: #059669;
            margin-top: 6px;
          }
          .product-rating {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
            padding: 10px 14px;
            background: #f9fafb;
            border-radius: 6px;
            width: fit-content;
            border: 1px solid #e5e7eb;
          }
          .product-button {
            width: 100%;
            max-width: 320px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
            transition: all 0.2s ease;
            text-transform: none;
            letter-spacing: 0;
            margin-bottom: 12px;
          }
          .product-button:hover {
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            box-shadow: 0 4px 8px rgba(245, 158, 11, 0.4);
            transform: translateY(-1px);
          }
          .product-button:active {
            transform: translateY(0);
          }
          .product-button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          .product-highlights-box {
            background: linear-gradient(to bottom, #f9fafb, #ffffff);
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          .product-info-box {
            background: #f0fdf4;
            border: 1px solid #86efac;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          }
          .product-section-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            margin-bottom: 24px;
          }
          .product-section-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #111827;
            padding-bottom: 12px;
            border-bottom: 2px solid #f3f4f6;
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

            {/* Quantity Selector */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "8px", color: "#374151" }}>
                Quantity:
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    background: "white",
                    cursor: "pointer",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: "60px",
                    height: "36px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    textAlign: "center",
                    fontSize: "14px"
                  }}
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    background: "white",
                    cursor: "pointer",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Stock & Delivery Info */}
            <div className="product-info-box" style={{ 
              marginBottom: "20px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#059669", fontSize: "16px" }}>✓</span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#065f46" }}>In Stock</span>
              </div>
              <div style={{ fontSize: "13px", color: "#047857", marginLeft: "24px" }}>
                {product.salePrice > 999 
                  ? "FREE delivery available. Order within 12 hours for fastest delivery."
                  : `Add ₹${Math.ceil(1000 - product.salePrice)} more for FREE delivery. Order within 12 hours for fastest delivery.`}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="product-button"
              >
                {addingToCart ? "Adding to Cart..." : "Add to Cart"}
              </button>
              <button
                onClick={async () => {
                  if (!isAuthenticated) {
                    navigate("/login");
                    return;
                  }
                  if (!product) return;
                  try {
                    setAddingToCart(true);
                    const response = await apiService.addToCart(product.id.toString(), quantity);
                    if (response.success) {
                      navigate("/checkout");
                    } else {
                      alert(response.error || "Failed to add product to cart");
                    }
                  } catch (err) {
                    alert("An error occurred");
                  } finally {
                    setAddingToCart(false);
                  }
                }}
                disabled={addingToCart}
                style={{
                  width: "100%",
                  maxWidth: "320px",
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #ffa500 0%, #ff8c00 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "15px",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(255, 165, 0, 0.3)",
                  transition: "all 0.2s ease"
                }}
                onMouseEnter={(e) => {
                  if (!addingToCart) {
                    e.currentTarget.style.background = "linear-gradient(135deg, #ff8c00 0%, #ff7700 100%)";
                    e.currentTarget.style.boxShadow = "0 4px 8px rgba(255, 165, 0, 0.4)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, #ffa500 0%, #ff8c00 100%)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(255, 165, 0, 0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Buy Now
              </button>
            </div>

            {/* Product Highlights */}
            <div className="product-highlights-box" style={{ 
              marginTop: "24px"
            }}>
              <h3 style={{ fontSize: "17px", fontWeight: "600", marginBottom: "14px", color: "#111827" }}>
                Product Highlights
              </h3>
              <ul style={{ margin: 0, paddingLeft: "22px", fontSize: "14px", color: "#374151", lineHeight: "2" }}>
                <li style={{ marginBottom: "6px" }}>
                  {product.rating >= 4 ? "Highly rated product" : "Quality assured product"}
                </li>
                <li style={{ marginBottom: "6px" }}>
                  {product.oldPrice > product.salePrice 
                    ? `Save ${Math.round(((product.oldPrice - product.salePrice) / product.oldPrice) * 100)}% on this item`
                    : "Best price guaranteed"}
                </li>
                <li style={{ marginBottom: "6px" }}>
                  {product.ratingCount > 0 
                    ? `Trusted by ${product.ratingCount} ${product.ratingCount === 1 ? 'customer' : 'customers'}`
                    : "New arrival"}
                </li>
                <li style={{ marginBottom: "6px" }}>
                  Category: {product.subcategory}
                </li>
                <li>Fast and secure delivery available</li>
              </ul>
            </div>

            {/* Delivery & Returns Info */}
            <div style={{ 
              marginTop: "20px", 
              padding: "16px", 
              background: "#f9fafb", 
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              fontSize: "13px", 
              color: "#4b5563",
              lineHeight: "1.8"
            }}>
              <div style={{ marginBottom: "10px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ color: "#059669", fontSize: "16px" }}>✓</span>
                <div>
                  <strong style={{ color: "#111827", display: "block", marginBottom: "2px" }}>Delivery:</strong>
                  <span>
                    {product.salePrice > 999 
                      ? "FREE delivery on orders over ₹999. Usually dispatched within 1-2 business days."
                      : "Usually dispatched within 1-2 business days. Add ₹" + Math.ceil(1000 - product.salePrice) + " more for FREE delivery."}
                  </span>
                </div>
              </div>
              <div style={{ marginBottom: "10px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ color: "#059669", fontSize: "16px" }}>✓</span>
                <div>
                  <strong style={{ color: "#111827", display: "block", marginBottom: "2px" }}>Returns:</strong>
                  <span>7 days return policy. No questions asked.</span>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <span style={{ color: "#059669", fontSize: "16px" }}>✓</span>
                <div>
                  <strong style={{ color: "#111827", display: "block", marginBottom: "2px" }}>Price:</strong>
                  <span>
                    {product.oldPrice > product.salePrice 
                      ? `You save ₹${(product.oldPrice - product.salePrice).toLocaleString()} (${Math.round(((product.oldPrice - product.salePrice) / product.oldPrice) * 100)}% OFF)`
                      : "Best price available"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Sections Below */}
        <div className="product-additional-sections" style={{ marginTop: "40px", padding: "0 20px" }}>
          {/* Product Description */}
          <div className="product-section-card">
            <h2 className="product-section-title">
              Product Description
            </h2>
            <p style={{ fontSize: "15px", color: "#374151", lineHeight: "1.8", marginBottom: "16px" }}>
              {product.subtitle || `${product.product} - A premium quality product from our ${product.subcategory} collection.`}
            </p>
            <p style={{ fontSize: "15px", color: "#374151", lineHeight: "1.8", marginBottom: "12px" }}>
              {product.rating >= 4 
                ? `This highly-rated product (${product.rating}/5 stars) has been loved by ${product.ratingCount} ${product.ratingCount === 1 ? 'customer' : 'customers'}. It's carefully selected and tested to ensure the highest quality standards.`
                : `This product from our ${product.subcategory} collection is carefully selected and tested to ensure the highest quality standards. We stand behind our products and offer excellent customer service.`}
            </p>
            <div style={{ 
              marginTop: "20px", 
              padding: "16px", 
              background: "#f9fafb", 
              borderRadius: "6px",
              borderLeft: "4px solid #f59e0b"
            }}>
              <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: "1.7", margin: 0 }}>
                <strong style={{ color: "#111827" }}>Why Choose This Product?</strong><br/>
                {product.oldPrice > product.salePrice 
                  ? `Get ${product.product} at an amazing ${Math.round(((product.oldPrice - product.salePrice) / product.oldPrice) * 100)}% discount! Our products are sourced from trusted suppliers and undergo rigorous quality checks. ${product.ratingCount > 0 ? `Join ${product.ratingCount} satisfied customers who have already purchased this item.` : 'Be among the first to experience this quality product.'}`
                  : `Our products are sourced from trusted suppliers and undergo rigorous quality checks. We prioritize customer satisfaction and offer hassle-free returns if you're not completely happy with your purchase.`}
              </p>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="product-section-card">
            <h2 className="product-section-title">
              Product Specifications
            </h2>
            <table style={{ width: "100%", fontSize: "14px", borderCollapse: "collapse" }}>
              <tbody>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "14px 0", fontWeight: "600", color: "#111827", width: "35%" }}>Product Name</td>
                  <td style={{ padding: "14px 0", color: "#374151" }}>{product.product}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "14px 0", fontWeight: "600", color: "#111827" }}>Category</td>
                  <td style={{ padding: "14px 0", color: "#374151" }}>{product.subcategory}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "14px 0", fontWeight: "600", color: "#111827" }}>Brand</td>
                  <td style={{ padding: "14px 0", color: "#374151" }}>ShriVesta</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "14px 0", fontWeight: "600", color: "#111827" }}>Price</td>
                  <td style={{ padding: "14px 0", color: "#374151" }}>
                    ₹{product.salePrice.toLocaleString()}
                    {product.oldPrice > product.salePrice && (
                      <span style={{ marginLeft: "8px", color: "#6b7280", textDecoration: "line-through", fontSize: "13px" }}>
                        ₹{product.oldPrice.toLocaleString()}
                      </span>
                    )}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "14px 0", fontWeight: "600", color: "#111827" }}>Discount</td>
                  <td style={{ padding: "14px 0", color: "#059669", fontWeight: "600" }}>
                    {product.oldPrice > product.salePrice 
                      ? `${Math.round(((product.oldPrice - product.salePrice) / product.oldPrice) * 100)}% OFF`
                      : "No discount"}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <td style={{ padding: "14px 0", fontWeight: "600", color: "#111827" }}>Rating</td>
                  <td style={{ padding: "14px 0", color: "#374151" }}>
                    <span style={{ color: "#fbbf24", marginRight: "4px" }}>★</span>
                    {product.rating}/5 ({product.ratingCount} {product.ratingCount === 1 ? 'review' : 'reviews'})
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "14px 0", fontWeight: "600", color: "#111827" }}>Availability</td>
                  <td style={{ padding: "14px 0", color: "#059669", fontWeight: "600" }}>
                    <span style={{ color: "#059669", marginRight: "6px" }}>●</span>
                    In Stock
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Customer Reviews Section */}
          <div className="product-section-card">
            <h2 className="product-section-title">
              Customer Reviews
            </h2>
            
            {/* Review Summary */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <div style={{ fontSize: "32px", fontWeight: "600", color: "#1f2937" }}>
                {product.rating}.0
              </div>
              <div>
                <div style={{ display: "flex", gap: "2px", marginBottom: "4px" }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: i < product.rating ? "#fbbf24" : "#d1d5db", fontSize: "18px" }}>
                      ★
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  Based on {product.ratingCount} {product.ratingCount === 1 ? 'review' : 'reviews'}
                </div>
              </div>
            </div>

            {/* Write Review Button (if authenticated and hasn't reviewed) */}
            {isAuthenticated && !userReview && (
              <div style={{ marginBottom: "24px" }}>
                {!showReviewForm ? (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    style={{
                      padding: "10px 20px",
                      background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                  >
                    Write a Review
                  </button>
                ) : (
                  <div style={{
                    padding: "20px",
                    background: "#f9fafb",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb"
                  }}>
                    <h3 style={{ fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#111827" }}>
                      Write Your Review
                    </h3>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                        Rating
                      </label>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReviewRating(i + 1)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "24px",
                              color: i < reviewRating ? "#fbbf24" : "#d1d5db",
                              padding: 0
                            }}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                        Comment (Optional)
                      </label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        style={{
                          width: "100%",
                          minHeight: "100px",
                          padding: "12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontFamily: "inherit",
                          resize: "vertical"
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <button
                        onClick={handleSubmitReview}
                        disabled={submittingReview}
                        style={{
                          padding: "10px 20px",
                          background: submittingReview ? "#9ca3af" : "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: "500",
                          cursor: submittingReview ? "not-allowed" : "pointer"
                        }}
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewComment("");
                          setReviewRating(5);
                        }}
                        style={{
                          padding: "10px 20px",
                          background: "white",
                          color: "#374151",
                          border: "1px solid #d1d5db",
                          borderRadius: "6px",
                          fontSize: "14px",
                          fontWeight: "500",
                          cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User's Existing Review */}
            {userReview && (
              <div style={{
                padding: "16px",
                background: "#fef3c7",
                borderRadius: "6px",
                border: "1px solid #fbbf24",
                marginBottom: "24px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                  <div>
                    <div style={{ fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                      Your Review
                    </div>
                    <div style={{ display: "flex", gap: "2px", marginBottom: "8px" }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: i < userReview.rating ? "#fbbf24" : "#d1d5db", fontSize: "14px" }}>
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {formatDate(userReview.createdAt)}
                  </div>
                </div>
                {userReview.comment && (
                  <p style={{ fontSize: "14px", color: "#374151", margin: 0 }}>
                    {userReview.comment}
                  </p>
                )}
              </div>
            )}

            {/* Reviews List */}
            {loadingReviews ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
                <p style={{ fontSize: "14px", color: "#6b7280" }}>Loading reviews...</p>
              </div>
            ) : totalReviewCount > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    style={{
                      padding: "16px",
                      background: "#ffffff",
                      borderRadius: "6px",
                      border: "1px solid #e5e7eb"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                      <div>
                        <div style={{ fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                          {review.user.name}
                        </div>
                        <div style={{ display: "flex", gap: "2px", marginBottom: "8px" }}>
                          {[...Array(5)].map((_, i) => (
                            <span key={i} style={{ color: i < review.rating ? "#fbbf24" : "#d1d5db", fontSize: "14px" }}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                    {review.comment && (
                      <p style={{ fontSize: "14px", color: "#374151", margin: 0, lineHeight: "1.5" }}>
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
                  No reviews yet. {isAuthenticated ? "Be the first to review this product!" : "Login to write a review."}
                </p>
                {!isAuthenticated && (
                  <button
                    onClick={() => navigate("/login")}
                    style={{
                      padding: "8px 16px",
                      background: "#f59e0b",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "13px",
                      fontWeight: "500",
                      cursor: "pointer"
                    }}
                  >
                    Login to Review
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
