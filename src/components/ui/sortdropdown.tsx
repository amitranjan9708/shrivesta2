import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./dropdown-menu"; // Adjust import path accordingly
import { ChevronDownIcon } from "lucide-react"; // For icon in the trigger button

type SortOption = "priceLowToHigh" | "priceHighToLow" | "rating";

interface SortDropdownProps {
  selected: SortOption;
  setSelected: (option: SortOption) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  selected,
  setSelected,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
      >
        Sort by: {selected === "priceLowToHigh" ? "Price: Low to High" : selected === "priceHighToLow" ? "Price: High to Low" : "Rating"}
        <ChevronDownIcon className="ml-2 h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={4} className="w-56 p-1">
        <DropdownMenuRadioGroup value={selected} onValueChange={setSelected}>
          <DropdownMenuRadioItem value="priceLowToHigh">
            Price: Low to High
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="priceHighToLow">
            Price: High to Low
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="rating">
            Rating
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
