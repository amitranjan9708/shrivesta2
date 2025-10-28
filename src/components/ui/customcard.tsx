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
  console.log(imageUrls);

  return (
    <div
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
      <div style={{ position: "relative", width: "100%", height: "320px" }}>
        <img
          src={hovered ? hoverImage : mainImage}
          alt={product}
          loading="eager"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "opacity 0.3s ease-in-out",
          }}
        />
      </div>

      {/* Info section */}
      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: "18px",
            color: "#222",
            marginBottom: "6px",
          }}
        >
          {product}
        </div>
        <div
          style={{
            color: "#666",
            fontSize: "14px",
            marginBottom: "10px",
          }}
        >
          {subtitle}
        </div>

        {/* Pricing */}
        <div style={{ marginBottom: "10px" }}>
          <span style={{ fontWeight: 600, fontSize: "17px", color: "#e67e22" }}>
            ₹{salePrice ? salePrice.toLocaleString() : "—"}
          </span>
          {oldPrice && (
            <span
              style={{
                textDecoration: "line-through",
                color: "#999",
                fontSize: "14px",
                marginLeft: "8px",
              }}
            >
              ₹{oldPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Rating */}
        <div style={{ display: "flex", alignItems: "center", fontSize: "15px" }}>
          <span style={{ color: "#FFD700", marginRight: "6px" }}>
            {"★".repeat(Math.floor(rating))}
            {"☆".repeat(5 - Math.floor(rating))}
          </span>
          <span style={{ color: "#777" }}>({ratingCount})</span>
        </div>
      </div>
    </div>
  );
};
