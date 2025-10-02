

import React, { useState } from "react";

const galleryImages = [
  "https://slimages.macysassets.com/is/image/MCY/products/0/optimized/31719270_fpx.tif?qlt=80,0&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=webp&wid=342&hei=417",
  "https://slimages.macysassets.com/is/image/MCY/products/0/optimized/31719270_fpx.tif?qlt=80,0&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=webp&wid=342&hei=417",
  "https://slimages.macysassets.com/is/image/MCY/products/0/optimized/31719270_fpx.tif?qlt=80,0&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=webp&wid=342&hei=417",
  "https://slimages.macysassets.com/is/image/MCY/products/0/optimized/31719270_fpx.tif?qlt=80,0&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=webp&wid=342&hei=417",
  "https://slimages.macysassets.com/is/image/MCY/products/0/optimized/31719270_fpx.tif?qlt=80,0&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=webp&wid=342&hei=417",
];

export default function ProductDetailCard() {
  const [selectedImg, setSelectedImg] = useState(galleryImages[0]);
  const sizes = ["36S", "36R", "38S", "38R", "40S", "40R", "42R", "44R", "46R"];

  return (
    <div style={{ maxWidth: 1200, margin: "30px auto", padding: 24, background: "#FFF" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 36 }}>
        {/* Thumbnails & Main image container */}
        <div style={{ display: "flex", flexDirection: "row", gap: 16 }}>
          {/* Thumbnails */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {galleryImages.map((img) => (
              <img
                key={img}
                src={img}
                alt=""
                style={{
                  width: 54,
                  height: 70,
                  objectFit: "cover",
                  cursor: "pointer",
                  border: selectedImg === img ? "2px solid #b91c1c" : "1px solid #eee",
                  borderRadius: 5,
                }}
                onClick={() => setSelectedImg(img)}
              />
            ))}
          </div>
          {/* Main image */}
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
        {/* Product info */}
        <div style={{ flex: 1, minWidth: 350 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>HUGO by Hugo Boss</div>
          <div style={{ color: "#757575", margin: "4px 0 8px 0" }}>
            Men's Modern-Fit Wool Blend Suit Jacket - CLOSE OUT!
          </div>
          <div>
            <span style={{ color: "#b91c1c", fontWeight: 700, fontSize: 21 }}>INR 12,834.00</span>
            <span style={{ textDecoration: "line-through", marginLeft: 10, color: "#222", fontSize: 14 }}>
              INR 21,450.00
            </span>
          </div>
          <div style={{ color: "#222", marginBottom: "9px" }}>60% off with VIP applied</div>
          <div style={{ color: "#444", marginBottom: 4 }}>Color: Grey</div>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>Size: </span>
            <span style={{ color: "#b0b0b0" }}>Please select</span>
            <div style={{ display: "flex", gap: 8, marginTop: 9 }}>
              {sizes.map((size) => (
                <button
                  key={size}
                  style={{
                    border: "1px solid #c7c7c7",
                    background: "#fff",
                    borderRadius: 3,
                    minWidth: 36,
                    padding: "6px 2px",
                    cursor: "pointer",
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <button
            style={{
              width: "100%",
              background: "#b91c1c",
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
              padding: "12px 0 14px 0",
              borderRadius: 3,
              border: "none",
              outline: "none",
              marginTop: 12,
              cursor: "pointer",
            }}
          >
            Add To Bag
          </button>
          {/* Offers */}
          <div style={{ marginTop: 32 }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 5 }}>Offers & perks</div>
            <div
              style={{
                background: "#f5f5f5",
                borderRadius: 5,
                border: "1px solid #e0e0e0",
                padding: 12,
                marginBottom: 6,
                fontSize: 15,
              }}
            >
              ⭐ Join Star Rewards & get free shipping at $39{" "}
              <span style={{ color: "#b91c1c", textDecoration: "underline", fontSize: 13 }}>
                Exclusions
              </span>
            </div>
            <div
              style={{
                background: "#f5f5f5",
                borderRadius: 5,
                border: "1px solid #e0e0e0",
                padding: 12,
                fontSize: 15,
              }}
            >
              🛒 Not a Star Rewards member? Get free shipping at $49{" "}
              <span style={{ color: "#b91c1c", textDecoration: "underline", fontSize: 13 }}>
                Exclusions apply
              </span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ border: "1px solid #eee", background: "#f9f9f9", borderRadius: 7, marginTop: 30, padding: 22 }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 17, color: "#333" }}>Product details</div>
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200, fontSize: 14 }}>Walk with a one-two punch of confidence and elegance when you enter your next formal event in this modern-fit jacket from HUGO by Hugo Boss.</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Product Features</div>
            <ul style={{ margin: 0, padding: "0 0 0 18px", fontSize: 14 }}>
              <li>Imported</li>
              <li>Notched lapels</li>
              <li>Button closures</li>
              <li>Two buttons</li>
              <li>Kissing buttons at the cuff</li>
              <li>Welt pocket at chest</li>
              <li>Flap pockets</li>
            </ul>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Size & Fit</div>
            Modern fit
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Materials & Care</div>
            Dry clean<br />
            Shell: 74% wool, 22% polyester, 4% elastane; lining: 100% polyester
          </div>
        </div>
      </div>
    </div>
  );
}
