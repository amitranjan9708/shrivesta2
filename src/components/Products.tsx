import React, { useState, useEffect, useMemo } from "react";
import { ProductCard } from "./ui/customcard";
import { SortDropdown } from "./ui/sortdropdown";
import { FilterSidebar } from "./FilterSidebar";
import { Button } from "./ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { apiService } from "../services/api";
import { Filter, ArrowLeft } from "lucide-react";

// Mobile styles for products page
const productsMobileStyles = `
  @media (max-width: 767px) {
    .products-page-wrapper {
      padding-top: 0 !important;
      background: #f5f5f5 !important;
    }
    .products-container {
      padding-left: 0 !important;
      padding-right: 0 !important;
      padding-top: 0 !important;
      max-width: 100% !important;
      background: #f5f5f5 !important;
    }
    .products-header-card {
      background: white !important;
      border-radius: 0 !important;
      border: none !important;
      box-shadow: none !important;
      padding: 14px 16px !important;
      margin-bottom: 8px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .products-header-card h2 {
      font-size: 14px !important;
      font-weight: 500 !important;
      color: #000000 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .products-header-card span {
      font-size: 12px !important;
      color: #666 !important;
      font-weight: 400 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .products-grid {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 8px !important;
      padding: 0 8px !important;
      background: #f5f5f5 !important;
    }
    .product-card-wrapper {
      width: 100% !important;
    }
  }
`;

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
  imagePublicIds?: string[];
  name?: string;
  description?: string;
}

const Products = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortOption, setSortOption] = useState<
    "priceLowToHigh" | "priceHighToLow" | "rating" | "newest"
  >("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filter states
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);

  const [searchParams] = useSearchParams();
  const subcategory = searchParams.get("subcategory");

  // Map frontend sort options to backend sortBy format
  const getSortByValue = (sortOption: "priceLowToHigh" | "priceHighToLow" | "rating" | "newest"): string => {
    switch (sortOption) {
      case "priceLowToHigh":
        return "price_low_to_high";
      case "priceHighToLow":
        return "price_high_to_low";
      case "rating":
        return "rating_high_to_low";
      case "newest":
        return "newest";
      default:
        return "newest";
    }
  };

  // Calculate min/max prices from all products
  const { minPrice, maxPrice } = useMemo(() => {
    if (allProducts.length === 0) return { minPrice: 0, maxPrice: 100000 };
    const prices = allProducts.map((p) => p.salePrice);
    return {
      minPrice: Math.floor(Math.min(...prices) / 100) * 100, // Round down to nearest 100
      maxPrice: Math.ceil(Math.max(...prices) / 100) * 100, // Round up to nearest 100
    };
  }, [allProducts]);

  // Get available subcategories
  const availableSubcategories = useMemo(() => {
    const subcats = new Set(allProducts.map((p) => p.subcategory));
    return Array.from(subcats).sort();
  }, [allProducts]);

  // Calculate active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) count++;
    if (selectedRatings.length > 0) count++;
    if (selectedSubcategories.length > 0) count++;
    return count;
  }, [priceRange, minPrice, maxPrice, selectedRatings, selectedSubcategories]);

  // Initialize price range when products are loaded
  useEffect(() => {
    if (allProducts.length > 0 && priceRange[1] === 100000) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [allProducts, minPrice, maxPrice]);

  // Fetch all products for filter options (without filters)
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await apiService.getProducts();
        if (response.success && response.data) {
          const data = response.data as { products?: Product[]; count?: number };
          setAllProducts(data.products || []);
        }
      } catch (err) {
        console.error("Error fetching all products:", err);
      }
    };
    fetchAllProducts();
  }, []);

  // Fetch filtered products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const sortBy = getSortByValue(sortOption);
        
        // Build query parameters
        const params: { subcategory?: string; sortBy: string; minPrice?: string; maxPrice?: string; minRating?: string; subcategories?: string } = {
          sortBy,
        };
        
        // Handle subcategory - either from URL or selected filters
        if (subcategory) {
          params.subcategory = subcategory;
        } else if (selectedSubcategories.length > 0) {
          params.subcategories = selectedSubcategories.join(',');
        }
        
        // Add price filters
        if (priceRange[0] > minPrice) {
          params.minPrice = priceRange[0].toString();
        }
        if (priceRange[1] < maxPrice) {
          params.maxPrice = priceRange[1].toString();
        }
        
        // Add rating filter (use minimum selected rating)
        if (selectedRatings.length > 0) {
          const minRating = Math.min(...selectedRatings);
          params.minRating = minRating.toString();
        }
        
        const response = await apiService.getProducts(
          params.subcategory,
          params.sortBy,
          params.minPrice,
          params.maxPrice,
          params.minRating,
          params.subcategories
        );
        
        console.log("Fetched products response:", response);
        if (response.success && response.data) {
          const data = response.data as { products?: Product[]; count?: number };
          setProducts(data.products || []);
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
  }, [subcategory, sortOption, priceRange, selectedRatings, selectedSubcategories, minPrice, maxPrice]);

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
      <style>{productsMobileStyles}</style>
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 lg:py-6 products-page-wrapper">
        <div className="products-container">
          {/* Myntra-style Mobile Header */}
          <div className="md:hidden mb-2">
            <div className="bg-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Link to="/" className="text-black">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                  {subcategory 
                    ? subcategory.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
                    : "ALL PRODUCTS"}
                </span>
              </div>
            </div>
          </div>

          {/* Header with Filters and Sort */}
          <div className="hidden md:flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              <h2 className="text-2xl font-bold text-gray-900">
                {subcategory 
                  ? subcategory.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
                  : "All Products"}
              </h2>
              {products.length > 0 && (
                <span className="text-sm text-gray-500">
                  ({products.length} {products.length === 1 ? "product" : "products"})
                </span>
              )}
            </div>
            <SortDropdown selected={sortOption} setSelected={setSortOption} />
          </div>

          {/* Mobile Filter and Sort Bar */}
          <div className="md:hidden mb-2 products-header-card">
            <div className="flex items-center justify-between mb-3">
              <Button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                variant="outline"
                className="flex items-center gap-2"
                style={{
                  fontSize: '12px',
                  padding: '8px 12px',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              <SortDropdown selected={sortOption} setSelected={setSortOption} />
            </div>
            {products.length > 0 && (
              <span style={{ fontSize: '12px', color: '#666', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                {products.length} {products.length === 1 ? "product" : "products"}
              </span>
            )}
          </div>

      <div className="flex gap-6 md:flex md:gap-6">
        {/* Filter Sidebar */}
        <FilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          minPrice={minPrice}
          maxPrice={maxPrice}
          selectedRatings={selectedRatings}
          onRatingChange={setSelectedRatings}
          selectedSubcategories={selectedSubcategories}
          onSubcategoryChange={setSelectedSubcategories}
          availableSubcategories={availableSubcategories}
          activeFiltersCount={activeFiltersCount}
        />

        {/* Products Grid - Centered */}
        <div className="flex-1 min-w-0 md:flex-1 md:min-w-0">
          {products.length > 0 ? (
            <div className={`products-grid flex flex-wrap gap-6 md:flex md:flex-wrap md:gap-6 ${
              isFilterOpen ? "justify-center lg:justify-start" : "justify-center"
            }`}>
        {products.map((product) => (
          <Link
            to={`/products/${product.id}`}
            key={product.id}
            className="block product-card-wrapper md:block"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <ProductCard
              imageUrls={product.imageUrls || []}
              product={product.product}
              id={product.id.toString()}
              subtitle={product.subtitle}
              oldPrice={product.oldPrice}
              salePrice={product.salePrice}
              rating={product.rating}
              ratingCount={product.ratingCount}
              subcategory={product.subcategory}
            />
          </Link>
        ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
              <p className="text-gray-600 text-lg mb-2">No products found</p>
              {activeFiltersCount > 0 && (
                <p className="text-sm text-gray-500 mb-4">
                  Try adjusting your filters
                </p>
              )}
              {activeFiltersCount > 0 && (
                <Button
                  onClick={() => {
                    setPriceRange([minPrice, maxPrice]);
                    setSelectedRatings([]);
                    setSelectedSubcategories([]);
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
    </>
  );
};

export default Products;
