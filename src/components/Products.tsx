import React from 'react';
import { ProductCard } from './ui/customcard';
import { SortDropdown } from "./ui/SortDropdown";
import { useState, useMemo } from "react";
import { Link } from 'react-router-dom';

const productList = [
  {
    imageSrc:
      "https://slimages.macysassets.com/is/image/MCY/products/0/optimized/31719270_fpx.tif?qlt=80,0&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=webp&wid=342&hei=417",
    product: "BOSS by Hugo Boss",
    id:1,
    subtitle: "Logo T-Shirt",
    oldPrice: 5311,
    vipPrice: 3160,
    salePrice: 4514,
    discountPercent: 41,
    rating: 4,
    ratingCount: 93,
    colors: ["#E9EFFF", "#212121", "#9FACDF"],
  },
  {
    imageSrc:
      "https://slimages.macysassets.com/is/image/MCY/products/0/optimized/31719270_fpx.tif?qlt=80,0&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=webp&wid=342&hei=417",
    product: "BOSS by Hugo Boss",
    id:2,
    subtitle: "Logo T-Shirt",
    oldPrice: 5311,
    vipPrice: 3160,
    salePrice: 4514,
    discountPercent: 41,
    rating: 4,
    ratingCount: 93,
    colors: ["#E9EFFF", "#212121", "#9FACDF"],
  },
  {
    imageSrc:
      "https://slimages.macysassets.com/is/image/MCY/products/0/optimized/31719270_fpx.tif?qlt=80,0&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=webp&wid=342&hei=417",
    product: "BOSS by Hugo Boss",
    id:3,
    subtitle: "Logo T-Shirt",
    oldPrice: 5311,
    vipPrice: 3160,
    salePrice: 4514,
    discountPercent: 41,
    rating: 4,
    ratingCount: 93,
    colors: ["#E9EFFF", "#212121", "#9FACDF"],
  },
  {
    imageSrc:
      "https://slimages.macysassets.com/is/image/MCY/products/0/optimized/31719270_fpx.tif?qlt=80,0&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=webp&wid=342&hei=417",
    product: "BOSS by Hugo Boss",
    id:4,
    subtitle: "Logo T-Shirt",
    oldPrice: 5311,
    vipPrice: 3160,
    salePrice: 4514,
    discountPercent: 41,
    rating: 4,
    ratingCount: 93,
    colors: ["#E9EFFF", "#212121", "#9FACDF"],
  },
  {
    imageSrc:
      "https://slimages.macysassets.com/is/image/MCY/products/0/optimized/31719270_fpx.tif?qlt=80,0&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=webp&wid=342&hei=417",
    product: "BOSS by Hugo Boss",
    id:5,
    subtitle: "Logo T-Shirt",
    oldPrice: 5311,
    vipPrice: 3160,
    salePrice: 4514,
    discountPercent: 41,
    rating: 4,
    ratingCount: 93,
    colors: ["#E9EFFF", "#212121", "#9FACDF"],
  },
  {
    imageSrc:
      "https://slimages.macysassets.com/is/image/MCY/products/0/optimized/31719270_fpx.tif?qlt=80,0&resMode=sharp2&op_usm=1.75,0.3,2,0&fmt=webp&wid=342&hei=417",
    product: "BOSS by Hugo Boss",
    id:6,
    subtitle: "Logo T-Shirt",
    oldPrice: 5311,
    vipPrice: 3160,
    salePrice: 4514,
    discountPercent: 41,
    rating: 4,
    ratingCount: 93,
    colors: ["#E9EFFF", "#212121", "#9FACDF"],
  },
  // add more products if needed
];

const Products = () => {
    const [sortOption, setSortOption] = useState<
    "priceLowToHigh" | "priceHighToLow" | "rating"
  >("priceLowToHigh");

  const sortedProducts = useMemo(() => {
    const productsCopy = [...productList];
    if (sortOption === "priceLowToHigh") {
      productsCopy.sort((a, b) => a.vipPrice - b.vipPrice);
    } else if (sortOption === "priceHighToLow") {
      productsCopy.sort((a, b) => b.vipPrice - a.vipPrice);
    } else if (sortOption === "rating") {
      productsCopy.sort((a, b) => b.rating - a.rating);
    }
    return productsCopy;
  }, [sortOption]);
  return (
    <>
      <div className="flex justify-start mb-4 ">
        <SortDropdown selected={sortOption} setSelected={setSortOption} />
      </div>
      <div className="flex flex-wrap gap-6 justify-center ">
  {sortedProducts.map((product, index) => (
    <Link
          to={`/products/${product.id}`}
          key={product.id}
          className="block"
          style={{ textDecoration: "none", color: "inherit" }} // optional inline reset
        >
          <ProductCard {...product} />
    </Link>
      ))}
    </div>

    </>
  );
};

export default Products;
