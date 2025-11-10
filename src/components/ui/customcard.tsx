import React, { useState } from "react";

type CardProps = {
  product: string;
  subtitle: string;
  oldPrice?: number; // optional
  salePrice?: number; // optional
  rating?: number;
  ratingCount?: number;
  imageUrls?: string[];
};

// Mobile styles for product card
const productCardMobileStyles = `
  @media (max-width: 767px) {
    .product-card-mobile {
      width: 100% !important;
      background: white !important;
      border-radius: 0 !important;
      border: none !important;
      box-shadow: none !important;
      overflow: hidden !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .product-card-image-container {
      height: auto !important;
      aspect-ratio: 3/4 !important;
    }
    .product-card-image {
      width: 100% !important;
      height: 100% !important;
      aspect-ratio: 3/4 !important;
      object-fit: cover !important;
    }
    .product-card-title {
      font-size: 13px !important;
      font-weight: 400 !important;
      color: #000000 !important;
      line-height: 1.4 !important;
      margin-bottom: 4px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .product-card-subtitle {
      font-size: 11px !important;
      color: #666 !important;
      margin-bottom: 6px !important;
      font-weight: 400 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .product-card-price {
      font-size: 14px !important;
      font-weight: 500 !important;
      color: #000000 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .product-card-old-price {
      font-size: 12px !important;
      color: #666 !important;
      text-decoration: line-through !important;
      font-weight: 400 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .product-card-rating {
      font-size: 10px !important;
      color: #666 !important;
      font-weight: 400 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
  }
`;

export const ProductCard: React.FC<CardProps> = ({
  product,
  subtitle,
  oldPrice,
  salePrice,
  rating = 0,
  ratingCount = 0,
  imageUrls = [],
}) => {
  const [hovered, setHovered] = useState(false);
  const mainImage = imageUrls?.[0] || "/placeholder-image.jpg";
  const hoverImage = imageUrls?.[1] || mainImage;

  return (
    <>
      <style>{productCardMobileStyles}</style>
      <div
        className="product-card-mobile"
        style={{
          width: "280px",
          background: "#fff",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          cursor: "pointer",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image section */}
        <div className="product-card-image-container" style={{ position: "relative", width: "100%", height: "320px" }}>
          <img
            src={hovered ? hoverImage : mainImage}
            alt={product}
            loading="eager"
            className="product-card-image"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "opacity 0.3s ease-in-out",
            }}
          />
        </div>

        {/* Info section */}
        <div style={{ padding: "12px 10px" }}>
          <div className="product-card-title"
            style={{
              fontWeight: 700,
              fontSize: "18px",
              color: "#222",
              marginBottom: "6px",
            }}
          >
            {product}
          </div>
          <div className="product-card-subtitle"
            style={{
              color: "#666",
              fontSize: "14px",
              marginBottom: "8px",
            }}
          >
            {subtitle}
          </div>

          {/* Pricing */}
          <div style={{ marginBottom: "8px", display: "flex", alignItems: "baseline", gap: "6px", flexWrap: "wrap" }}>
            <span className="product-card-price" style={{ fontWeight: 600, fontSize: "17px", color: "#e67e22" }}>
              ₹{salePrice ? salePrice.toLocaleString() : "—"}
            </span>
            {oldPrice && (
              <span className="product-card-old-price"
                style={{
                  textDecoration: "line-through",
                  color: "#999",
                  fontSize: "14px",
                }}
              >
                ₹{oldPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="product-card-rating" style={{ display: "flex", alignItems: "center", fontSize: "15px" }}>
            <span style={{ color: "#FFD700", marginRight: "6px", fontSize: "12px" }}>
              {"★".repeat(Math.floor(rating))}
              {"☆".repeat(5 - Math.floor(rating))}
            </span>
            <span style={{ color: "#777", fontSize: "11px" }}>({ratingCount})</span>
          </div>
        </div>
      </div>
    </>
  );
};
