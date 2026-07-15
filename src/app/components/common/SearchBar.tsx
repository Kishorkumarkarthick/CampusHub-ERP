import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "../ui/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search database records...",
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative w-full max-w-md font-sans", className)}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground select-none">
        <Search className="w-4 h-4" />
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-xs transition-all placeholder:text-muted-foreground text-foreground"
      />

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Clear Search Input"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
