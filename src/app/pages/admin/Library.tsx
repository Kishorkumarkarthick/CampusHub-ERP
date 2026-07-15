import React, { useState, useEffect } from "react";
import { Plus, Search, BookOpen, User, BookMarked, Trash2, CheckCircle, HelpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../services/api";

interface Book {
  id?: number;
  isbn: string;
  title: string;
  author: string;
  category: string;
  status: "Available" | "Borrowed";
  borrowedBy?: string;
  dueDate?: string;
}

export default function AdminLibrary() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Computer Science", "Mathematics", "Physics"];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Add Book dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editIsbn, setEditIsbn] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editCat, setEditCat] = useState("Computer Science");

  // Borrow Dialog states
  const [isBorrowOpen, setIsBorrowOpen] = useState(false);
  const [selectedBookForBorrow, setSelectedBookForBorrow] = useState<Book | null>(null);
  const [borrowStudent, setBorrowStudent] = useState("");
  const [borrowDue, setBorrowDue] = useState("");

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/books");
      setBooks(res.data);
    } catch (err) {
      console.error("Failed to load library books", err);
      toast.error("Failed to load library books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "All" || book.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const exists = books.find((b) => b.isbn === editIsbn);
    if (exists) {
      toast.error("Book with this ISBN already exists.");
      return;
    }

    try {
      const newBook = {
        isbn: editIsbn,
        title: editTitle,
        author: editAuthor,
        category: editCat,
      };
      await api.post("/api/books", newBook);
      toast.success("Textbook registered to library catalog!");
      fetchBooks();
    } catch (err) {
      console.error("Failed to add book", err);
      toast.error("Failed to register book.");
    }
    
    // Reset Form
    setIsAddOpen(false);
    setEditIsbn("");
    setEditTitle("");
    setEditAuthor("");
  };

  const handleReturn = async (id: number) => {
    try {
      await api.put(`/api/books/${id}/return`);
      toast.success("Book marked as returned.");
      fetchBooks();
    } catch (err) {
      console.error("Failed to return book", err);
      toast.error("Failed to complete book return.");
    }
  };

  const openBorrowModal = (book: Book) => {
    setSelectedBookForBorrow(book);
    setBorrowStudent("");
    setBorrowDue("");
    setIsBorrowOpen(true);
  };

  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForBorrow || !selectedBookForBorrow.id) return;

    try {
      await api.put(
        `/api/books/${selectedBookForBorrow.id}/borrow?studentName=${encodeURIComponent(
          borrowStudent
        )}&dueDate=${encodeURIComponent(borrowDue)}`
      );
      toast.success(`Book borrowed successfully to ${borrowStudent}`);
      setIsBorrowOpen(false);
      setSelectedBookForBorrow(null);
      fetchBooks();
    } catch (err) {
      console.error("Failed to borrow book", err);
      toast.error("Failed to complete issue request.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/books/${id}`);
      toast.success("Book deleted from registry.");
      fetchBooks();
    } catch (err) {
      console.error("Failed to delete book", err);
      toast.error("Failed to delete book.");
    }
  };

  return (
    <div className="space-y-6 font-sans text-left pb-12 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Library Books</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Manage textbook catalogs, register new references, and issue borrowings to students.
          </p>
        </div>

        <button
          onClick={() => {
            setEditIsbn("");
            setEditTitle("");
            setEditAuthor("");
            setIsAddOpen(true);
          }}
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer active:scale-95 transition-all select-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reference Book</span>
        </button>
      </div>

      {/* Filter and search actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans"
          />
        </div>

        <div className="flex gap-2 select-none overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-purple-600 text-white"
                    : "bg-secondary/40 border border-border/80 text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : (
        /* Table listing */
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">
                  <th className="py-3.5 px-6">Book Reference / ISBN</th>
                  <th className="py-3.5 px-6">Author</th>
                  <th className="py-3.5 px-6 text-center">Category</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6">Details</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => {
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
                          <span className="inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] bg-purple-600/10 text-purple-600">
                            {book.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center select-none">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase select-none ${
                              isAvailable
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-red-500/10 text-red-600 dark:text-red-400 animate-pulse"
                            }`}
                          >
                            {book.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold">
                          {isAvailable ? (
                            <span className="text-emerald-600 flex items-center gap-1.5 select-none">
                              <CheckCircle className="w-3.5 h-3.5" /> Ready for issue
                            </span>
                          ) : (
                            <div className="text-[11px] text-muted-foreground font-medium">
                              <p>Borrower: <span className="font-bold text-foreground">{book.borrowedBy}</span></p>
                              <p className="mt-0.5">Due: <span className="font-bold text-red-500">{book.dueDate}</span></p>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right select-none">
                          <div className="flex gap-2 justify-end items-center">
                            {isAvailable ? (
                              <button
                                onClick={() => openBorrowModal(book)}
                                className="py-1 px-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] cursor-pointer"
                              >
                                Issue Book
                              </button>
                            ) : (
                              <button
                                onClick={() => book.id && handleReturn(book.id)}
                                className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] cursor-pointer"
                              >
                                Mark Return
                              </button>
                            )}
                            <button
                              onClick={() => book.id && handleDelete(book.id)}
                              className="p-1 rounded-lg border border-border hover:bg-red-500/10 text-muted-foreground hover:text-red-500 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 px-6 text-center text-sm text-muted-foreground">
                      No reference books match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Book modal overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl p-6 relative overflow-hidden text-left animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold border-b border-border/60 pb-3 mb-4 flex items-center gap-2 select-none">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span>Register Textbook</span>
            </h3>

            <form onSubmit={handleAddBook} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">ISBN Reference</label>
                <input
                  type="text"
                  value={editIsbn}
                  onChange={(e) => setEditIsbn(e.target.value)}
                  placeholder="e.g. 978-0131103627"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Book Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Clean Code"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Book Author(s)</label>
                <input
                  type="text"
                  value={editAuthor}
                  onChange={(e) => setEditAuthor(e.target.value)}
                  placeholder="e.g. Robert C. Martin"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Category Index</label>
                <select
                  value={editCat}
                  onChange={(e) => setEditCat(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs font-sans text-foreground"
                >
                  {categories.slice(1).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border/50 select-none">
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="py-2 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Borrow Book modal overlay */}
      {isBorrowOpen && selectedBookForBorrow && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-xl p-6 relative overflow-hidden text-left animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold border-b border-border/60 pb-3 mb-4 flex items-center gap-2 select-none">
              <BookMarked className="w-5 h-5 text-purple-600" />
              <span>Issue Book Reference</span>
            </h3>

            <p className="text-xs text-muted-foreground font-medium mb-4 leading-normal select-none">
              Issuing: <span className="font-bold text-foreground">{selectedBookForBorrow.title}</span> by {selectedBookForBorrow.author}
            </p>

            <form onSubmit={handleBorrowSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Borrower Name (Student)</label>
                <input
                  type="text"
                  value={borrowStudent}
                  onChange={(e) => setBorrowStudent(e.target.value)}
                  placeholder="e.g. Kishore Kumar"
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Due Return Date</label>
                <input
                  type="date"
                  value={borrowDue}
                  onChange={(e) => setBorrowDue(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border/50 select-none">
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer"
                >
                  Issue Book
                </button>
                <button
                  type="button"
                  onClick={() => setIsBorrowOpen(false)}
                  className="py-2 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-bold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
