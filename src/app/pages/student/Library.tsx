import React, { useState, useEffect } from "react";
import { BookOpen, Search, Bookmark, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

interface Book {
  isbn: string;
  title: string;
  author: string;
  category: string;
  status: "Available" | "Borrowed";
  dueDate?: string;
}

export default function StudentLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Computer Science", "Mathematics", "Physics"];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/books");
      setBooks(res.data);
    } catch (err) {
      console.error("Failed to load catalog books", err);
      toast.error("Failed to load library catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter books
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || book.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSearchTerm("");
    setCurrentPage(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left font-sans pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Library Catalog</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Search textbook titles, check category indices, and inspect due dates of borrowed manuals.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left column: categories */}
          <div className="space-y-4">
            <h3 className="font-bold text-base text-foreground pb-2 border-b border-border/60 flex items-center gap-2 select-none">
              <Bookmark className="w-5 h-5 text-indigo-500" />
              <span>Categories</span>
            </h3>

            <div className="flex flex-row lg:flex-col flex-wrap gap-2 pt-1 select-none">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`py-2 px-4 rounded-xl text-xs font-bold text-left transition-all cursor-pointer whitespace-nowrap lg:w-full ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                        : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right column: Search + Book list */}
          <div className="lg:col-span-3 space-y-6">
            {/* Actions panel */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card border border-border p-4 rounded-2xl shadow-sm">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search by title, author, or ISBN..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs font-sans"
                />
              </div>
            </div>

            {/* Book Catalog Grid Table */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border bg-secondary/20 font-bold text-sm text-foreground flex items-center gap-1.5 select-none">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <span>Available References ({filteredBooks.length})</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">
                      <th className="py-3 px-6">Book Title / ISBN</th>
                      <th className="py-3 px-6">Author</th>
                      <th className="py-3 px-6 text-center">Status</th>
                      <th className="py-3 px-6 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {paginatedBooks.length > 0 ? (
                      paginatedBooks.map((book) => {
                        const isAvailable = book.status === "Available";
                        return (
                          <tr key={book.isbn} className="hover:bg-secondary/15 transition-colors text-xs">
                            <td className="py-4 px-6 text-left">
                              <p className="font-bold text-foreground leading-snug">{book.title}</p>
                              <p className="text-[10px] text-muted-foreground font-mono font-semibold mt-1">
                                ISBN: {book.isbn}
                              </p>
                            </td>
                            <td className="py-4 px-6 text-muted-foreground font-medium">{book.author}</td>
                            <td className="py-4 px-6 text-center">
                              <span
                                className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider select-none ${
                                  isAvailable
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse"
                                }`}
                              >
                                {book.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right select-none">
                              {isAvailable ? (
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-end gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready for issue
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-red-600 flex items-center justify-end gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5" /> Due {book.dueDate}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-8 px-6 text-center text-sm text-muted-foreground font-semibold">
                          No textbooks match your query parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-border flex justify-between items-center bg-secondary/10">
                  <span className="text-xs text-muted-foreground select-none">
                    Showing <span className="font-bold text-foreground">{startIndex + 1}</span> to{" "}
                    <span className="font-bold text-foreground">
                      {Math.min(startIndex + itemsPerPage, filteredBooks.length)}
                    </span>{" "}
                    of <span className="font-bold text-foreground">{filteredBooks.length}</span> entries
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-border bg-card hover:bg-secondary/40 text-muted-foreground disabled:opacity-50 cursor-pointer disabled:pointer-events-none"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-border bg-card hover:bg-secondary/40 text-muted-foreground disabled:opacity-50 cursor-pointer disabled:pointer-events-none"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
