import React, { useState, useMemo, useEffect } from "react";
import { ProductCard } from "./ui/customcard";
import { SortDropdown } from "./ui/sortdropdown";
import { Link, useSearchParams } from "react-router-dom";
import { apiService } from "../services/api";

interface Product {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  salePrice?: number;
  rating?: number;
  ratingCount: number;
  subcategory: string;
  imageUrls: string[];
  category: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortOption, setSortOption] = useState<
    "priceLowToHigh" | "priceHighToLow" | "rating"
  >("priceLowToHigh");

  const [searchParams] = useSearchParams();
  const subcategory = searchParams.get("subcategory");

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProducts();
        console.log("Fetched products response:", response);
        if (response.success && response.data) {
          setProducts(response.data.products);
        } else {
          setError("Failed to fetch products");
        }
      } catch (err) {
        setError("An error occurred while fetching products");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products by subcategory
  // const filteredProducts = useMemo(() => {
  //   if (subcategory) {
  //     return products.filter((product) => product.subcategory === subcategory);
  //   }
  //   return products;
  // }, [products]);

  // Sort products
  // const sortedProducts = useMemo(() => {
  //   const productsCopy=[];
  //   if (sortOption === "priceLowToHigh") {
  //     productsCopy.sort((a, b) => a.salePrice - b.vipPrice);
  //   } else if (sortOption === "priceHighToLow") {
  //     productsCopy.sort((a, b) => b.vipPrice - a.vipPrice);
  //   } else if (sortOption === "rating") {
  //     productsCopy.sort((a, b) => b.rating - a.rating);
  //   }
  //   return productsCopy;
  // }, [ sortOption]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">No products found</p>
          {subcategory && (
            <p className="text-sm text-gray-500 mt-2">
              No products found in the "{subcategory}" category
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-start mb-4">
        <SortDropdown selected={sortOption} setSelected={setSortOption} />
      </div>
      <div className="flex flex-wrap gap-6 justify-center">
        {products.map((product) => (
          <Link
            to={`/products/${product.id}`}
            key={product.id}
            className="block"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <ProductCard
              imageUrls={product.imageUrls || []}
              product={product.brand || product.name}
              id={product.id}
              subtitle={product.description}
              oldPrice={product.price}
              salePrice={product.salePrice}
              rating={product.rating}
              ratingCount={product.ratingCount}
              subcategory={product.subcategory}
            />
          </Link>
        ))}
      </div>
    </>
  );
};

export default Products;
