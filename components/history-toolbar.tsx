"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, CalendarIcon, Plus } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { AudioFile } from "@/types/transcription";
import { useAudio } from "./context/audios-list-context";

/**
 * Render a toolbar with a search input, status filter dropdown, date range picker, and new column button for the history view.
 *
 * @returns A JSX element containing: a search input with leading icon, a dropdown for status filtering (All, Done, Processing, Error, Unknown), date range picker, and new column button.
 */
export function HistoryToolbar() {
  const { audios, setAudios } = useAudio();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [originalAudios, setOriginalAudios] = useState<AudioFile[]>([]);

  useEffect(() => {
    if (originalAudios.length === 0 && audios.length > 0) {
      setOriginalAudios(audios);
    }
  }, [audios, originalAudios.length]);

  const filteredAudios = useMemo(() => {
    let filtered = [...originalAudios];

    if (searchQuery.trim()) {
      filtered = filtered.filter((audio) =>
        audio.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedStatus !== "All") {
      const statusMap: Record<string, string> = {
        Done: "done",
        Processing: "processing",
        Error: "error",
        Unknown: "unknown",
      };
      const mappedStatus =
        statusMap[selectedStatus] || selectedStatus.toLowerCase();
      filtered = filtered.filter(
        (audio) => audio.transcription_status.toLowerCase() === mappedStatus,
      );
    }

    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((audio) => {
        const audioDate = new Date(audio.created_at);
        const fromMatch = dateRange.from ? audioDate >= dateRange.from : true;
        const toMatch = dateRange.to
          ? audioDate <= new Date(dateRange.to.setHours(23, 59, 59, 999))
          : true;
        return fromMatch && toMatch;
      });
    }

    return filtered;
  }, [originalAudios, searchQuery, selectedStatus, dateRange]);

  useEffect(() => {
    setAudios(filteredAudios);
  }, [filteredAudios, setAudios]);

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

