import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle, Clock, AlertCircle, Loader2, FileText, Printer } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

interface Invoice {
  id?: number;
  invoiceNumber: string;
  studentName: string;
  rollNo: string;
  department: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
}

interface Transaction {
  id?: number;
  txnNumber: string;
  invoiceNumber: string;
  studentName: string;
  date: string;
  amount: number;
  method: string;
  status: "Success" | "Failed";
}

export default function StudentFees() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<"invoices" | "transactions">("invoices");

  const [payingId, setPayingId] = useState<number | null>(null);

  const [studentRollNo, setStudentRollNo] = useState("");

  const fetchData = async () => {
    if (!user?.email) return;
    try {
      setLoading(true);
      // 1. Fetch Student profile to get roll number
      const studentRes = await api.get("/api/students");
      const currentStudent = studentRes.data.find((s: any) => s.email === user.email);

      if (currentStudent) {
        setStudentRollNo(currentStudent.rollNo);

        // 2. Fetch invoices & transactions
        const [invRes, txnRes] = await Promise.all([
          api.get("/api/fees/invoices"),
          api.get("/api/fees/transactions"),
        ]);

        // Filter invoices matching rollNo
        const studentInvoices = invRes.data.filter(
          (inv: any) => inv.rollNo === currentStudent.rollNo
        );
        setInvoices(studentInvoices);

        // Filter transactions matching studentName or rollNo
        const studentTxns = txnRes.data.filter(
          (txn: any) => txn.studentName.toLowerCase() === currentStudent.name.toLowerCase()
        );
        setTransactions(studentTxns);
      }
    } catch (err) {
      console.error("Failed to load student fee ledger details", err);
      toast.error("Failed to load fee ledger statements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.email]);

  const handlePay = async (id: number, amount: number, invoiceNo: string) => {
    try {
      setPayingId(id);
      
      // Call collect payment REST API
      await api.put(`/api/fees/invoices/${id}/collect`);

      toast.success(`Payment of ₹${amount.toLocaleString('en-IN')} for ${invoiceNo} completed successfully!`);
      fetchData();
    } catch (err) {
      console.error("Payment failed", err);
      toast.error("Payment transaction failed. Please try again.");
    } finally {
      setPayingId(null);
    }
  };

  const pendingAmount = invoices
    .filter((inv) => inv.status !== "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const paidAmount = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left font-sans pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Fees & Invoices</h1>
        <p className="text-sm text-muted-foreground font-medium">
          View current billing statements, review payment history, and pay outstanding semester dues.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          {/* Dials / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
            {/* Outstanding Dues */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Outstanding Dues
                </p>
                <p className={`text-3xl font-extrabold ${pendingAmount > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>
                  ₹{pendingAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-muted-foreground">Pending invoices sum</p>
              </div>
              <div className={`p-4 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 ${pendingAmount > 0 ? "animate-pulse" : ""}`}>
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* Total Paid */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Total Paid
                </p>
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                  ₹{paidAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-[11px] text-muted-foreground">Current academic session</p>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>

            {/* Quick Help Card */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Payment Queries
                </p>
                <p className="text-xl font-extrabold text-foreground">
                  Registrar Office
                </p>
                <p className="text-[11px] text-muted-foreground">Room 102 - Admin Block</p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Toggle Tabs */}
          <div className="flex border-b border-border select-none">
            <button
              onClick={() => setActiveTab("invoices")}
              className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-all ${
                activeTab === "invoices" ? "border-indigo-600 text-indigo-600" : "border-transparent text-muted-foreground"
              }`}
            >
              Academic Invoices
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-all ${
                activeTab === "transactions" ? "border-indigo-600 text-indigo-600" : "border-transparent text-muted-foreground"
              }`}
            >
              Transaction Receipts
            </button>
          </div>

          {activeTab === "invoices" ? (
            /* Invoice Ledger Table */
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/20 font-bold text-sm text-foreground flex items-center gap-1.5 select-none">
                <CreditCard className="w-4 h-4 text-indigo-500" />
                <span>Academic Invoice Ledger</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">
                      <th className="py-3 px-6">Invoice ID</th>
                      <th className="py-3 px-6">Department Stream</th>
                      <th className="py-3 px-6">Amount</th>
                      <th className="py-3 px-6">Due Date</th>
                      <th className="py-3 px-6 text-center">Status</th>
                      <th className="py-3 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {invoices.length > 0 ? (
                      invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-secondary/15 transition-colors text-xs">
                          <td className="py-4 px-6 font-semibold text-foreground">{inv.invoiceNumber}</td>
                          <td className="py-4 px-6 font-bold">{inv.department || "General Tuition"}</td>
                          <td className="py-4 px-6 font-bold text-foreground">₹{inv.amount.toLocaleString('en-IN')}</td>
                          <td className="py-4 px-6 text-muted-foreground font-semibold">{inv.dueDate}</td>
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase select-none ${
                                inv.status === "Paid"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {inv.status !== "Paid" && inv.id ? (
                              <button
                                onClick={() => handlePay(inv.id!, inv.amount, inv.invoiceNumber)}
                                disabled={payingId !== null}
                                className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none select-none"
                              >
                                {payingId === inv.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Processing...</span>
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Pay Dues</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-[11px] text-muted-foreground font-semibold italic select-none">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 px-6 text-center text-xs text-muted-foreground font-semibold">
                          No invoices issued to your student account ledger.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Transaction Receipts Ledger Table */
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-100">
              <div className="p-4 border-b border-border bg-secondary/20 font-bold text-sm text-foreground flex items-center gap-1.5 select-none">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span>Transaction Receipts</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">
                      <th className="py-3 px-6">Receipt No</th>
                      <th className="py-3 px-6">Invoice ID</th>
                      <th className="py-3 px-6">Payment Date</th>
                      <th className="py-3 px-6">Amount Paid</th>
                      <th className="py-3 px-6">Method</th>
                      <th className="py-3 px-6 text-center">Status</th>
                      <th className="py-3 px-6 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {transactions.length > 0 ? (
                      transactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-secondary/15 transition-colors text-xs">
                          <td className="py-4 px-6 font-bold text-purple-600">{txn.txnNumber}</td>
                          <td className="py-4 px-6 font-semibold text-foreground">{txn.invoiceNumber}</td>
                          <td className="py-4 px-6 text-muted-foreground font-semibold">{txn.date}</td>
                          <td className="py-4 px-6 font-bold text-foreground">₹{txn.amount.toLocaleString('en-IN')}</td>
                          <td className="py-4 px-6 font-semibold text-muted-foreground">{txn.method}</td>
                          <td className="py-4 px-6 text-center">
                            <span className="inline-flex px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 select-none">
                              {txn.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              onClick={() => window.print()}
                              className="p-1 rounded-lg border border-border hover:bg-secondary/40 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 px-6 text-center text-xs text-muted-foreground font-semibold">
                          No transaction records found on your billing statement.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
