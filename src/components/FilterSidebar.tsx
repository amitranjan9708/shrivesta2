import React, { useState, useEffect } from "react";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { X, Filter, IndianRupee, Star, Tag } from "lucide-react";

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  minPrice: number;
  maxPrice: number;
  selectedRatings: number[];
  onRatingChange: (ratings: number[]) => void;
  selectedSubcategories: string[];
  onSubcategoryChange: (subcategories: string[]) => void;
  availableSubcategories: string[];
  activeFiltersCount: number;
  hasPendingChanges?: boolean;
  onApplyFilters?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  isOpen,
  onClose,
  priceRange,
  onPriceRangeChange,
  minPrice,
  maxPrice,
  selectedRatings,
  onRatingChange,
  selectedSubcategories,
  onSubcategoryChange,
  availableSubcategories,
  activeFiltersCount,
  hasPendingChanges = false,
  onApplyFilters,
}) => {
  // Local state for input values to allow free typing
  const [minPriceInput, setMinPriceInput] = useState<string>(priceRange[0].toString());
  const [maxPriceInput, setMaxPriceInput] = useState<string>(priceRange[1].toString());

  // Update local state when priceRange prop changes (from slider or external)
  useEffect(() => {
    setMinPriceInput(priceRange[0].toString());
    setMaxPriceInput(priceRange[1].toString());
  }, [priceRange]);

  const handleRatingToggle = (rating: number) => {
    if (selectedRatings.includes(rating)) {
      onRatingChange(selectedRatings.filter((r) => r !== rating));
    } else {
      onRatingChange([...selectedRatings, rating]);
    }
  };

  const handleSubcategoryToggle = (subcategory: string) => {
    if (selectedSubcategories.includes(subcategory)) {
      onSubcategoryChange(selectedSubcategories.filter((s) => s !== subcategory));
    } else {
      onSubcategoryChange([...selectedSubcategories, subcategory]);
    }
  };

  const clearAllFilters = () => {
    onPriceRangeChange([minPrice, maxPrice]);
    onRatingChange([]);
    onSubcategoryChange([]);
  };

  return (
    <>
      {/* Overlay - only on desktop when open */}
      {isOpen && (
        <div
          className="hidden lg:block fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - full width on mobile (when open), right-aligned modal on desktop */}
      <div className={`${
        isOpen ? "block" : "hidden"
      } w-full lg:fixed lg:right-0 lg:top-0 lg:bottom-0 lg:w-80 lg:z-50 bg-gradient-to-b from-white to-gray-50 shadow-2xl overflow-y-auto lg:rounded-l-xl lg:border-2 lg:border-gray-200 mb-6 lg:mb-0 lg:mt-0 lg:h-screen rounded-xl border-2 border-gray-200`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg shadow-md">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeFiltersCount} active
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-all hover:scale-110 active:scale-95"
              aria-label="Close filters"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Clear All Button */}
          {activeFiltersCount > 0 && (
            <Button
              onClick={clearAllFilters}
              variant="outline"
              className="w-full mb-6 text-sm font-semibold border-2 border-gray-300 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 transition-all shadow-sm hover:shadow-md"
            >
              Clear All Filters
            </Button>
          )}

          {/* Price Range Filter */}
          <div className="mb-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <IndianRupee className="h-4 w-4 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Price Range</h3>
            </div>
            <div className="px-2">
              <Slider
                value={[priceRange[0], priceRange[1]]}
                onValueChange={(values) => {
                  onPriceRangeChange([values[0], values[1]]);
                }}
                min={minPrice}
                max={maxPrice}
                step={100}
                className="mb-4"
              />
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Min Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input
                      type="number"
                      value={minPriceInput}
                      onChange={(e) => {
                        setMinPriceInput(e.target.value);
                      }}
                      onBlur={(e) => {
                        const inputValue = e.target.value.trim();
                        if (inputValue === "" || isNaN(Number(inputValue))) {
                          setMinPriceInput(priceRange[0].toString());
                          return;
                        }
                        const numValue = Number(inputValue);
                        const clampedValue = Math.max(minPrice, Math.min(maxPrice, numValue));
                        setMinPriceInput(clampedValue.toString());
                        onPriceRangeChange([clampedValue, priceRange[1]]);
                      }}
                      className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-gray-50 hover:bg-white"
                    />
                  </div>
                </div>
                <span className="mt-6 text-gray-400 font-bold text-lg">-</span>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Max Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input
                      type="number"
                      value={maxPriceInput}
                      onChange={(e) => {
                        setMaxPriceInput(e.target.value);
                      }}
                      onBlur={(e) => {
                        const inputValue = e.target.value.trim();
                        if (inputValue === "" || isNaN(Number(inputValue))) {
                          setMaxPriceInput(priceRange[1].toString());
                          return;
                        }
                        const numValue = Number(inputValue);
                        const clampedValue = Math.max(minPrice, Math.min(maxPrice, numValue));
                        setMaxPriceInput(clampedValue.toString());
                        onPriceRangeChange([priceRange[0], clampedValue]);
                      }}
                      className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all bg-gray-50 hover:bg-white"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 px-3 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                <p className="text-sm font-semibold text-amber-900 text-center">
                  ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="mb-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Customer Rating</h3>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const isSelected = selectedRatings.includes(rating);
                return (
                  <label
                    key={rating}
                    className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-sm"
                        : "hover:bg-gray-50 border-2 border-transparent"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleRatingToggle(rating)}
                      className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                    />
                    <div className="flex items-center gap-2.5 flex-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < rating ? "text-amber-400" : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className={`text-sm font-medium ${
                        isSelected ? "text-amber-900" : "text-gray-700"
                      }`}>
                        {rating === 5 ? "5 Stars" : `${rating} & Up`}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Category Filter */}
          {availableSubcategories.length > 0 && (
            <div className="mb-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <Tag className="h-4 w-4 text-amber-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900">Category</h3>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {availableSubcategories.map((subcategory) => {
                  const isSelected = selectedSubcategories.includes(subcategory);
                  return (
                    <label
                      key={subcategory}
                      className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 shadow-sm"
                          : "hover:bg-gray-50 border-2 border-transparent"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSubcategoryToggle(subcategory)}
                        className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                      <span className={`text-sm font-medium capitalize ${
                        isSelected ? "text-amber-900" : "text-gray-700"
                      }`}>
                        {subcategory.replace(/-/g, " ")}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Apply Filters Button */}
          {onApplyFilters && (
            <div className="sticky bottom-0 bg-gradient-to-b from-transparent via-white to-white pt-4 pb-4 border-t-2 border-gray-200 mt-6">
              <Button
                onClick={() => {
                  onApplyFilters();
                  onClose();
                }}
                disabled={!hasPendingChanges}
                className="w-full py-3 text-base font-semibold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Filters
                {hasPendingChanges && (
                  <span className="ml-2 px-2 py-0.5 bg-white/30 rounded-full text-xs">
                    {activeFiltersCount > 0 ? "Update" : "Apply"}
                  </span>
                )}
              </Button>
            </div>
          )}
          
          {/* Custom Scrollbar Styles */}
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #fbbf24;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #f59e0b;
            }
          `}</style>
        </div>
      </div>
    </>
  );
};

