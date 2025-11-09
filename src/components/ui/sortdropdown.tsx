import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./dropdown-menu";
import { ChevronDownIcon, ArrowUpDown } from "lucide-react";

type SortOption = "priceLowToHigh" | "priceHighToLow" | "rating" | "newest";

interface SortDropdownProps {
  selected: SortOption;
  setSelected: (option: SortOption) => void;
}

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "priceLowToHigh", label: "Price: Low to High" },
  { value: "priceHighToLow", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

const getSortLabel = (value: SortOption): string => {
  const option = sortOptions.find((opt) => opt.value === value);
  return option?.label || "Sort";
};

export const SortDropdown: React.FC<SortDropdownProps> = ({
  selected,
  setSelected,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all">
        <ArrowUpDown className="h-4 w-4 text-gray-600" />
        <span>{getSortLabel(selected)}</span>
        <ChevronDownIcon className="ml-1 h-4 w-4 text-gray-500" />
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={8} className="w-64 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Sort By
        </div>
        <DropdownMenuRadioGroup value={selected} onValueChange={setSelected}>
          {sortOptions.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="px-3 py-2.5 rounded-md hover:bg-amber-50 cursor-pointer focus:bg-amber-50 transition-colors"
            >
              <span className="text-sm text-gray-700">{option.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
