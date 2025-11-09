import React, { useState, useEffect, useMemo } from "react";
import { ProductCard } from "./ui/customcard";
import { SortDropdown } from "./ui/sortdropdown";
import { FilterSidebar } from "./FilterSidebar";
import { Button } from "./ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { apiService } from "../services/api";
import { Filter, X } from "lucide-react";

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
  
  // Pending filter states (what user selects, doesn't trigger API)
  const [pendingPriceRange, setPendingPriceRange] = useState<[number, number]>([0, 100000]);
  const [pendingRatings, setPendingRatings] = useState<number[]>([]);
  const [pendingSubcategories, setPendingSubcategories] = useState<string[]>([]);
  
  // Applied filter states (what triggers API calls)
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number]>([0, 100000]);
  const [appliedRatings, setAppliedRatings] = useState<number[]>([]);
  const [appliedSubcategories, setAppliedSubcategories] = useState<string[]>([]);

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

  // Calculate active filters count (based on applied filters)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (appliedPriceRange[0] !== minPrice || appliedPriceRange[1] !== maxPrice) count++;
    if (appliedRatings.length > 0) count++;
    if (appliedSubcategories.length > 0) count++;
    return count;
  }, [appliedPriceRange, minPrice, maxPrice, appliedRatings, appliedSubcategories]);
  
  // Check if there are pending changes
  const hasPendingChanges = useMemo(() => {
    return (
      pendingPriceRange[0] !== appliedPriceRange[0] ||
      pendingPriceRange[1] !== appliedPriceRange[1] ||
      JSON.stringify(pendingRatings.sort()) !== JSON.stringify(appliedRatings.sort()) ||
      JSON.stringify(pendingSubcategories.sort()) !== JSON.stringify(appliedSubcategories.sort())
    );
  }, [pendingPriceRange, appliedPriceRange, pendingRatings, appliedRatings, pendingSubcategories, appliedSubcategories]);

  // Initialize price range when products are loaded
  useEffect(() => {
    if (allProducts.length > 0 && pendingPriceRange[1] === 100000) {
      setPendingPriceRange([minPrice, maxPrice]);
      setAppliedPriceRange([minPrice, maxPrice]);
    }
  }, [allProducts, minPrice, maxPrice]);
  
  // Apply filters function
  const handleApplyFilters = () => {
    setAppliedPriceRange(pendingPriceRange);
    setAppliedRatings(pendingRatings);
    setAppliedSubcategories(pendingSubcategories);
  };

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
        } else if (appliedSubcategories.length > 0) {
          params.subcategories = appliedSubcategories.join(',');
        }
        
        // Add price filters (use applied price range)
        if (appliedPriceRange[0] > minPrice) {
          params.minPrice = appliedPriceRange[0].toString();
        }
        if (appliedPriceRange[1] < maxPrice) {
          params.maxPrice = appliedPriceRange[1].toString();
        }
        
        // Add rating filter (use minimum selected rating)
        if (appliedRatings.length > 0) {
          const minRating = Math.min(...appliedRatings);
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
  }, [subcategory, sortOption, appliedPriceRange, appliedRatings, appliedSubcategories, minPrice, maxPrice]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header with Filters and Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
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
          <SortDropdown selected={sortOption} setSelected={setSortOption} />
        </div>
      </div>

      {/* Active Filters Chips */}
      {activeFiltersCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* Price Range Filter */}
          {(appliedPriceRange[0] !== minPrice || appliedPriceRange[1] !== maxPrice) && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300 shadow-sm">
              <span className="text-sm font-medium">
                Price: ₹{appliedPriceRange[0].toLocaleString()} - ₹{appliedPriceRange[1].toLocaleString()}
              </span>
              <button
                onClick={() => {
                  setAppliedPriceRange([minPrice, maxPrice]);
                  setPendingPriceRange([minPrice, maxPrice]);
                }}
                className="ml-1 p-0.5 hover:bg-amber-200 rounded-full transition-colors"
                aria-label="Remove price filter"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Rating Filters */}
          {appliedRatings.map((rating) => (
            <div
              key={rating}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300 shadow-sm"
            >
              <span className="text-sm font-medium">
                {rating === 5 ? "5 Stars" : `${rating}+ Stars`}
              </span>
              <button
                onClick={() => {
                  const newRatings = appliedRatings.filter((r) => r !== rating);
                  setAppliedRatings(newRatings);
                  setPendingRatings(newRatings);
                }}
                className="ml-1 p-0.5 hover:bg-amber-200 rounded-full transition-colors"
                aria-label={`Remove ${rating} star filter`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Subcategory Filters */}
          {appliedSubcategories.map((subcategory) => (
            <div
              key={subcategory}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300 shadow-sm"
            >
              <span className="text-sm font-medium capitalize">
                {subcategory.replace(/-/g, " ")}
              </span>
              <button
                onClick={() => {
                  const newSubcategories = appliedSubcategories.filter((s) => s !== subcategory);
                  setAppliedSubcategories(newSubcategories);
                  setPendingSubcategories(newSubcategories);
                }}
                className="ml-1 p-0.5 hover:bg-amber-200 rounded-full transition-colors"
                aria-label={`Remove ${subcategory} filter`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filter Sidebar - Full width on mobile, right-aligned modal on desktop */}
      <FilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        priceRange={pendingPriceRange}
        onPriceRangeChange={setPendingPriceRange}
        minPrice={minPrice}
        maxPrice={maxPrice}
        selectedRatings={pendingRatings}
        onRatingChange={setPendingRatings}
        selectedSubcategories={pendingSubcategories}
        onSubcategoryChange={setPendingSubcategories}
        availableSubcategories={availableSubcategories}
        activeFiltersCount={activeFiltersCount}
        hasPendingChanges={hasPendingChanges}
        onApplyFilters={handleApplyFilters}
      />

      {/* Products Grid - Centered, full width on desktop when filter is modal */}
      <div className="w-full">
          {products.length > 0 ? (
            <div className={`flex flex-wrap gap-6 ${
              isFilterOpen ? "justify-center lg:justify-start" : "justify-center"
            }`}>
        {products.map((product) => (
          <Link
            to={`/products/${product.id}`}
            key={product.id}
            className="block"
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
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-12">
              <div className="mb-6">
                <p className="text-gray-900 text-xl font-semibold mb-2">No products found</p>
                {activeFiltersCount > 0 ? (
                  <p className="text-sm text-gray-600">
                    No products match your current filters. Remove filters above to see more products.
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    {subcategory 
                      ? `No products found in the "${subcategory.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())}" category`
                      : "No products available at the moment"}
                  </p>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <Button
                  onClick={() => {
                    setAppliedPriceRange([minPrice, maxPrice]);
                    setAppliedRatings([]);
                    setAppliedSubcategories([]);
                    setPendingPriceRange([minPrice, maxPrice]);
                    setPendingRatings([]);
                    setPendingSubcategories([]);
                  }}
                  variant="outline"
                  className="mt-2 border-2 border-amber-500 text-amber-700 hover:bg-amber-50"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
    </div>
  );
};

export default Products;
