import React, { useState, useEffect } from "react";
import api from "../../services/api";
import {
  CreditCard,
  AlertCircle,
  CheckCircle,
  DollarSign,
  X,
  Printer,
  ArrowRight,
  FileText,
  TrendingUp,
} from "lucide-react";
import SearchBar from "../../components/common/SearchBar";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { cn } from "../../components/ui/utils";

type FeesTab = "invoices" | "transactions";
type InvoiceStatus = "Paid" | "Pending" | "Overdue";
type PaymentMethod = "Credit Card" | "Bank Transfer" | "PayPal";

interface Invoice {
  id: string;
  studentName: string;
  rollNo: string;
  department: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
}

interface Transaction {
  id: string;
  invoiceId: string;
  studentName: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  status: "Success" | "Failed";
}

const INITIAL_INVOICES: Invoice[] = [
  { id: "INV-2026-001", studentName: "Kishore Kumar", rollNo: "2023CS1045", department: "Computer Science & Engineering", amount: 1250, dueDate: "2026-08-15", status: "Pending" },
  { id: "INV-2026-002", studentName: "Jane Smith", rollNo: "2023CS1046", department: "Computer Science & Engineering", amount: 1250, dueDate: "2026-08-15", status: "Paid" },
  { id: "INV-2026-003", studentName: "Robert Johnson", rollNo: "2024EE1089", department: "Electrical Engineering", amount: 1100, dueDate: "2026-07-05", status: "Overdue" },
  { id: "INV-2026-004", studentName: "Emily Davis", rollNo: "2022ME2041", department: "Mechanical Engineering", amount: 1100, dueDate: "2026-07-05", status: "Paid" },
  { id: "INV-2026-005", studentName: "Michael Brown", rollNo: "2023BA1005", department: "Business Administration", amount: 1400, dueDate: "2026-08-15", status: "Pending" },
  { id: "INV-2026-006", studentName: "Sophia Garcia", rollNo: "2023CS1047", department: "Computer Science & Engineering", amount: 1250, dueDate: "2026-08-15", status: "Paid" },
  { id: "INV-2026-007", studentName: "Daniel Wilson", rollNo: "2024EE1090", department: "Electrical Engineering", amount: 1100, dueDate: "2026-07-05", status: "Overdue" },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "TXN-89021", invoiceId: "INV-2026-002", studentName: "Jane Smith", date: "2026-07-01 10:24 AM", amount: 1250, method: "Credit Card", status: "Success" },
  { id: "TXN-89022", invoiceId: "INV-2026-004", studentName: "Emily Davis", date: "2026-07-02 04:30 PM", amount: 1100, method: "Bank Transfer", status: "Success" },
  { id: "TXN-89023", invoiceId: "INV-2026-006", studentName: "Sophia Garcia", date: "2026-07-05 09:15 AM", amount: 1250, method: "PayPal", status: "Success" },
  { id: "TXN-89024", invoiceId: "INV-2026-003", studentName: "Robert Johnson", date: "2026-07-04 11:10 AM", amount: 1100, method: "Credit Card", status: "Failed" },
];

const DEPARTMENTS = [
  "Computer Science & Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "Civil Engineering",
  "Electronics & Communication",
  "Information Technology",
  "Chemical Engineering",
  "Aerospace Engineering",
  "Physics & Materials Science",
];

export default function Fees() {
  const [activeTab, setActiveTab] = useState<FeesTab>("invoices");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("All Departments");
  const [filterStatus, setFilterStatus] = useState("All Statuses");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected invoice details for receipt print view
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Collect Dues Dialog State
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [invoiceToCollect, setInvoiceToCollect] = useState<Invoice | null>(null);

  // Alert State
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const triggerAlert = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Filter Invoice entries
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.rollNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = filterDept === "All Departments" || inv.department === filterDept;
    const matchesStatus = filterStatus === "All Statuses" || inv.status === filterStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Filter Transaction logs
  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.invoiceId.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Pagination calculations
  const totalPages =
    activeTab === "invoices"
      ? Math.ceil(filteredInvoices.length / itemsPerPage)
      : Math.ceil(filteredTransactions.length / itemsPerPage);

  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset pagination on search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDept, filterStatus, activeTab]);

  // Open Collect Dues dialog
  const openCollectDues = (invoice: Invoice) => {
    setInvoiceToCollect(invoice);
    setIsCollectOpen(true);
  };

  const fetchFeesData = async () => {
    try {
      const [invRes, txnRes] = await Promise.all([
        api.get("/api/fees/invoices"),
        api.get("/api/fees/transactions"),
      ]);

      const normalizedInvoices = invRes.data.map((inv: any) => ({
        ...inv,
        id: String(inv.id),
      }));

      const normalizedTransactions = txnRes.data.map((txn: any) => ({
        ...txn,
        id: String(txn.id),
        invoiceId: txn.invoiceNumber, // align model field names
      }));

      setInvoices(normalizedInvoices);
      setTransactions(normalizedTransactions);
    } catch (err) {
      console.error("Failed to load fees data", err);
    }
  };

  useEffect(() => {
    fetchFeesData();
  }, []);

  // Manual payment collection confirm logic
  const handleConfirmCollection = async () => {
    if (invoiceToCollect) {
      try {
        await api.put(`/api/fees/invoices/${invoiceToCollect.id}/collect`);
        triggerAlert(`Manually collected payment for ${invoiceToCollect.invoiceNumber}.`);
        fetchFeesData();
      } catch (err) {
        console.error("Failed to collect payment", err);
      }
      setIsCollectOpen(false);
      setInvoiceToCollect(null);
    }
  };

  // Financial Calculations
  const totalCollected = invoices
    .filter((i) => i.status === "Paid")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalOutstanding = invoices
    .filter((i) => i.status !== "Paid")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const collectionRate =
    invoices.length === 0
      ? 0
      : Math.round((totalCollected / (totalCollected + totalOutstanding)) * 100);

  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;

  return (
    <div className="space-y-6 font-sans pb-12 transition-colors duration-300">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Financial Center</h1>
          <p className="text-xs text-muted-foreground">
            Monitor college tuition bills, verify paid invoices, print receipts, and balance ledger statements.
          </p>
        </div>
      </div>

      {/* Success Alert Banner */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Top Tab Controllers */}
      <div className="grid grid-cols-2 gap-2 bg-secondary/50 p-1.5 rounded-2xl border border-border/60 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab("invoices")}
          className={cn(
            "flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeTab === "invoices"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10 border border-border/10"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          )}
        >
          <FileText className="w-4.5 h-4.5" />
          <span>Invoices Register</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("transactions")}
          className={cn(
            "flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer",
            activeTab === "transactions"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10 border border-border/10"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
          )}
        >
          <CreditCard className="w-4.5 h-4.5" />
          <span>Transactions Ledger</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 select-none">
        <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block font-sans">Total Collected</span>
            <span className="text-2xl font-extrabold">₹{totalCollected.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Outstanding Dues</span>
            <span className="text-2xl font-extrabold">₹{totalOutstanding.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Collection Rate</span>
            <span className="text-2xl font-extrabold">{collectionRate}%</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Overdue Invoices</span>
            <span className="text-2xl font-extrabold">{overdueCount}</span>
          </div>
        </div>
      </div>

      {/* Search & Filters Controls Bar */}
      <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex flex-col md:flex-row justify-between gap-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={
            activeTab === "invoices"
              ? "Search by student name, roll number, or invoice ID..."
              : "Search transactions by name, tx ID, or invoice ID..."
          }
          className="flex-grow max-w-full md:max-w-md"
        />

        {activeTab === "invoices" && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Department filter */}
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs font-semibold text-foreground cursor-pointer"
            >
              <option value="All Departments">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/40 text-xs font-semibold text-foreground cursor-pointer"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Paid">Paid Only</option>
              <option value="Pending">Pending Only</option>
              <option value="Overdue">Overdue Only</option>
            </select>
          </div>
        )}
      </div>

      {/* Financial records grid - responsive table */}
      <div className="rounded-2xl border border-border bg-card text-card-foreground shadow-sm overflow-hidden">
        {activeTab === "invoices" ? (
          filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto opacity-75" />
              <p className="font-bold text-foreground">No invoices matches found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/30 select-none text-[10px] uppercase font-bold text-muted-foreground">
                      <th className="py-4 px-6">Invoice ID</th>
                      <th className="py-4 px-4">Student Details</th>
                      <th className="py-4 px-4">Roll Number</th>
                      <th className="py-4 px-4">Total Amount</th>
                      <th className="py-4 px-4">Due Date</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {paginatedInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-muted/15 transition-colors duration-150">
                        <td className="py-4 px-6 font-mono font-bold text-xs">{invoice.id}</td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-sm text-foreground">{invoice.studentName}</p>
                          <p className="text-[10px] text-muted-foreground">{invoice.department}</p>
                        </td>
                        <td className="py-4 px-4 font-mono font-semibold">{invoice.rollNo}</td>
                        <td className="py-4 px-4 font-extrabold text-sm">₹{invoice.amount.toLocaleString('en-IN')}</td>
                        <td className="py-4 px-4 font-semibold text-muted-foreground">{invoice.dueDate}</td>
                        <td className="py-4 px-4">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider",
                              invoice.status === "Paid" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/15",
                              invoice.status === "Pending" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/15",
                              invoice.status === "Overdue" && "bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/15"
                            )}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-1.5">
                          {invoice.status !== "Paid" && (
                            <button
                              onClick={() => openCollectDues(invoice)}
                              className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline cursor-pointer border border-primary/20 hover:border-primary px-2.5 py-1 rounded-xl transition-all"
                            >
                              Collect <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {invoice.status === "Paid" && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setIsReceiptOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                              title="Print Receipt"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Grid View */}
              <div className="block md:hidden p-4 space-y-4">
                {paginatedInvoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs">{invoice.id}</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider",
                          invoice.status === "Paid" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                          invoice.status === "Pending" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                          invoice.status === "Overdue" && "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        )}
                      >
                        {invoice.status}
                      </span>
                    </div>

                    <div className="py-2 border-t border-b border-border/40 text-xs grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Student Details</span>
                        <span className="font-bold text-sm block truncate">{invoice.studentName}</span>
                        <span className="text-[10px] text-muted-foreground block font-mono">{invoice.rollNo}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Amount Dues</span>
                        <span className="font-extrabold text-sm block">₹{invoice.amount.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-muted-foreground block font-medium">Due: {invoice.dueDate}</span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-1">
                      {invoice.status !== "Paid" ? (
                        <button
                          onClick={() => openCollectDues(invoice)}
                          className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline cursor-pointer border border-primary/20 hover:border-primary px-3 py-1.5 rounded-xl transition-all"
                        >
                          Collect Payment <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsReceiptOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print Receipt
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p className="font-bold">No transactions found</p>
          </div>
        ) : (
          <>
            {/* Desktop Transactions Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/30 select-none text-[10px] uppercase font-bold text-muted-foreground">
                    <th className="py-4 px-6">Transaction ID</th>
                    <th className="py-4 px-4">Invoice Reference</th>
                    <th className="py-4 px-4">Student Details</th>
                    <th className="py-4 px-4">Amount</th>
                    <th className="py-4 px-4">Method</th>
                    <th className="py-4 px-4">Timestamp</th>
                    <th className="py-4 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-muted/15 transition-colors duration-150">
                      <td className="py-4 px-6 font-mono font-bold">{txn.id}</td>
                      <td className="py-4 px-4 font-mono font-semibold">{txn.invoiceId}</td>
                      <td className="py-4 px-4 font-bold text-foreground">{txn.studentName}</td>
                      <td className="py-4 px-4 font-extrabold text-sm">₹{txn.amount.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-4 font-semibold text-muted-foreground">{txn.method}</td>
                      <td className="py-4 px-4 text-muted-foreground">{txn.date}</td>
                      <td className="py-4 px-6 text-right">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider",
                            txn.status === "Success" || (txn.status as any) === "Focus"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {txn.status === ("Focus" as any) ? "Success" : txn.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Transactions Cards Grid View */}
            <div className="block md:hidden p-4 space-y-4">
              {paginatedTransactions.map((txn) => (
                <div key={txn.id} className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs">{txn.id}</span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider",
                        txn.status === "Success" || (txn.status as any) === "Focus"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-rose-500/10 text-rose-600"
                      )}
                    >
                      {txn.status === ("Focus" as any) ? "Success" : txn.status}
                    </span>
                  </div>

                  <div className="py-2 border-t border-border/40 text-xs grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Student / Invoice</span>
                      <span className="font-bold text-sm block truncate">{txn.studentName}</span>
                      <span className="text-[10px] text-muted-foreground block font-mono">Ref: {txn.invoiceId}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase block">Amount Paid</span>
                      <span className="font-extrabold text-sm block">₹{txn.amount.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-muted-foreground block font-medium font-mono">{txn.method}</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-muted-foreground font-semibold text-right select-none">
                    Log Date: {txn.date}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination bar */}
        <div className="px-6 border-t border-border/40 bg-card">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={activeTab === "invoices" ? filteredInvoices.length : filteredTransactions.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </div>

      {/* OVERLAY MODAL 1: Print Receipt Overlay Details */}
      {isReceiptOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => setIsReceiptOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-xl z-10 animate-in fade-in zoom-in-95 duration-200 print-modal-container">
            <button
              onClick={() => setIsReceiptOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer print-modal-close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Printable Receipt Layout */}
            <div className="space-y-6 font-sans">
              <div className="text-center border-b border-border/50 pb-4 select-none">
                <span className="text-[9px] font-bold uppercase tracking-widest text-primary block">Official Receipt</span>
                <h3 className="text-xl font-extrabold text-foreground mt-0.5">CampusHub University</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Financial Services Division</p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receipt Number:</span>
                  <span className="font-mono font-bold">REC-2026-{selectedInvoice.id.split("-")[2]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Reference:</span>
                  <span className="font-mono font-semibold">{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Date:</span>
                  <span className="font-semibold">Today, {new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student Name:</span>
                  <span className="font-bold text-foreground">{selectedInvoice.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Roll Number:</span>
                  <span className="font-mono font-semibold">{selectedInvoice.rollNo}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-b border-border/50 py-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider select-none">Dues Items Breakdown</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between py-0.5">
                    <span>Semester Tuition Fee</span>
                    <span className="font-semibold">₹{(selectedInvoice.amount * 0.8).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Laboratory &amp; Technology Levy</span>
                    <span className="font-semibold">₹{(selectedInvoice.amount * 0.12).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Student Activities &amp; Athletics</span>
                    <span className="font-semibold">₹{(selectedInvoice.amount * 0.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-foreground">
                <span>Total Amount Cleared</span>
                <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">₹{selectedInvoice.amount.toLocaleString('en-IN')}</span>
              </div>

              {/* Signature section */}
              <div className="pt-8 flex justify-between items-end text-[10px] select-none">
                <div>
                  <span className="block border-t border-border/60 w-28 text-center pt-1 text-muted-foreground font-semibold">Student Sign</span>
                </div>
                <div className="text-right">
                  <span className="block border-t border-border/60 w-28 text-center pt-1 text-muted-foreground font-semibold">Registrar Office</span>
                </div>
              </div>
            </div>

            {/* Print action buttons */}
            <div className="mt-6 flex justify-end gap-3 print-modal-actions">
              <button
                onClick={() => setIsReceiptOpen(false)}
                className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-accent text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer"
              >
                Close Receipt
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold active:scale-[0.98] transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DIALOG 2: Collect Payment Confirm */}
      <ConfirmDialog
        isOpen={isCollectOpen}
        title="Confirm Payment Collection"
        message={`Are you sure you want to manually mark the invoice "${invoiceToCollect?.id}" for "${invoiceToCollect?.studentName}" as PAID? This records a successful Credit Card transaction of ₹${invoiceToCollect?.amount.toLocaleString('en-IN')} in the general ledger.`}
        confirmLabel="Collect &amp; Clear"
        cancelLabel="Discard"
        onConfirm={handleConfirmCollection}
        onCancel={() => {
          setIsCollectOpen(false);
          setInvoiceToCollect(null);
        }}
        variant="info"
      />
    </div>
  );
}
