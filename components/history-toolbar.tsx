"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown } from "lucide-react";

export interface HistoryToolbarProps {
  selectedStatus: string;
  setSelectedStatus: (arg: string) => void;
  searchQuery: string;
  setSearchQuery: (arg: string) => void;
}

/**
 * Renders a toolbar with a controlled search input and a status filter dropdown.
 *
 * @param selectedStatus - Label currently shown on the dropdown trigger
 * @param setSelectedStatus - Callback invoked with the new status when a dropdown item is selected
 * @param searchQuery - Current value of the search input
 * @param setSearchQuery - Callback invoked with the updated search text as the user types
 * @returns The toolbar JSX element containing the search input (with leading search icon) and a status dropdown with items: All, Done, Processing, Error, Unknown
 */
export function HistoryToolbar({
  selectedStatus,
  setSelectedStatus,
  searchQuery,
  setSearchQuery,
}: HistoryToolbarProps) {
  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-9 h-10 bg-background w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 bg-transparent">
              {selectedStatus}
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusSelect("All")}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusSelect("Done")}>
              Done
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusSelect("Processing")}>
              Processing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusSelect("Error")}>
              Error
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusSelect("Unknown")}>
              Unknown
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}