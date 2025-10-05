"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Calendar, Filter, ChevronDown, Plus } from "lucide-react";

export function HistoryToolbar() {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-9 h-10 bg-background w-full"
          />
        </div>

        <Button size="lg" className="h-10 flex-shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          New flow
        </Button>
      </div>

      {/* Filter toolbar */}
      <div className="flex items-center justify-end gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 bg-transparent">
              All
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>All</DropdownMenuItem>
            <DropdownMenuItem>Completed</DropdownMenuItem>
            <DropdownMenuItem>Processing</DropdownMenuItem>
            <DropdownMenuItem>Failed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" className="h-9 bg-transparent">
          <Calendar className="w-4 h-4 mr-2" />
          Date Range
        </Button>

        <Button variant="outline" size="sm" className="h-9 bg-transparent">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>

        <Button variant="outline" size="sm" className="h-9 bg-transparent">
          <Plus className="w-4 h-4 mr-2" />
          Add new column
        </Button>
      </div>
    </div>
  );
}
