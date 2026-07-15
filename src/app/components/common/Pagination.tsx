import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Generate range of page numbers to render
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Calculate shown ranges (e.g., Showing 1 to 10 of 43 entries)
  const renderRangeText = () => {
    if (totalItems === undefined || itemsPerPage === undefined) return null;
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    return (
      <span className="text-xs text-muted-foreground select-none">
        Showing <strong className="font-semibold text-foreground">{start}</strong> to{" "}
        <strong className="font-semibold text-foreground">{end}</strong> of{" "}
        <strong className="font-semibold text-foreground">{totalItems}</strong> entries
      </span>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-border/40 font-sans w-full">
      {/* Items Range Summary */}
      <div className="shrink-0">
        {renderRangeText()}
      </div>

      {/* Pages Controllers */}
      <nav className="flex items-center gap-1" aria-label="Pagination Navigation">
        {/* Prev Page Button */}
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors active:scale-95 cursor-pointer"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Buttons List */}
        {getPageNumbers().map((page) => {
          const isActive = page === currentPage;
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-current={isActive ? "page" : undefined}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all active:scale-95 cursor-pointer border ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Page Button */}
        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:pointer-events-none transition-colors active:scale-95 cursor-pointer"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
}
