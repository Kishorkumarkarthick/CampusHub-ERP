import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api, { API_BASE_URL } from "../../services/api";
import {
  Shield,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  AlertCircle,
  FileText,
  Send,
  Building,
} from "lucide-react";
import { cn } from "../../components/ui/utils";

interface RequestItem {
  id: number;
  studentId: string;
  studentName: string;
  department: string;
  semester: string;
  requestType: "Leave" | "Bonafide" | "Marksheet";
  reason: string;
  attachment?: string;
  startDate?: string;
  endDate?: string;
  facultyStatus: string;
  facultyRemarks: string;
  academicAdminStatus: string;
  academicAdminRemarks: string;
  finalStatus: string;
  createdDate: string;
  updatedDate: string;
}

export default function AdminApprovals() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  // Approval Overlay / Remarks state
  const [selectedReq, setSelectedReq] = useState<RequestItem | null>(null);
  const [remarks, setRemarks] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/requests/admin");
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch admin requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (status: "Approved" | "Rejected" | "Completed") => {
    if (!selectedReq) return;
    try {
      setErrorMsg(null);
      await api.put(
        `/api/requests/${selectedReq.requestType.toLowerCase()}/${selectedReq.id}/admin`,
        null,
        {
          params: { status, remarks },
        }
      );
      
      let message = `Request successfully ${status === "Approved" ? "approved" : status === "Completed" ? "marked as Completed / Ready for Download" : "rejected"}!`;
      setSuccessMsg(message);
      setSelectedReq(null);
      setRemarks("");
      fetchRequests();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg("Failed to update request status");
    }
  };

  const handleDownloadPdf = (id: number, type: string) => {
    const downloadUrl = `${API_BASE_URL}/api/requests/${type.toLowerCase()}/${id}/pdf`;
    window.open(downloadUrl, "_blank");
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch = (r.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.studentId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.department || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || r.requestType === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate metrics
  const pendingCount = requests.filter((r) => r.academicAdminStatus === "Pending").length;
  const approvedCount = requests.filter((r) => r.academicAdminStatus === "Approved" || r.finalStatus === "Academic Admin Approved").length;
  const completedCount = requests.filter((r) => r.finalStatus === "Completed").length;

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Academic Admin Requests Panel</h1>
        <p className="text-sm text-muted-foreground">Approve, reject, issue credentials, and monitor leave or certificate requests forwarded by faculty.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Pending Admin Endorsement</p>
            <p className="text-xl font-bold">{pendingCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Certificates Generated / Approved</p>
            <p className="text-xl font-bold">{approvedCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Certificates Completed / Issued</p>
            <p className="text-xl font-bold">{completedCount}</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl flex items-center gap-2 text-xs">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Requests Table */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-base font-bold">Forwarded Student Applications</h2>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students/departments..."
                className="pl-9 pr-4 py-1.5 w-full bg-muted/40 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-muted/40 border border-border rounded-xl text-xs focus:outline-none"
              >
                <option value="All">All Types</option>
                <option value="Leave">Leave Request</option>
                <option value="Bonafide">Bonafide Request</option>
                <option value="Marksheet">Marksheet Request</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-muted-foreground">Loading forwarded applications...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
            No forwarded student request applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                  <th className="py-3 px-2">Student</th>
                  <th className="py-3 px-2">Request Type</th>
                  <th className="py-3 px-2">Purpose / Duration</th>
                  <th className="py-3 px-2">Endorsed By</th>
                  <th className="py-3 px-2">Admin Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={`${req.requestType}-${req.id}`} className="border-b border-border/50 hover:bg-muted/10">
                    <td className="py-4 px-2">
                      <p className="font-bold">{req.studentName}</p>
                      <p className="text-[10px] text-muted-foreground">{req.studentId} | {req.department}</p>
                    </td>
                    <td className="py-4 px-2 font-semibold">
                      <span className="flex items-center gap-1.5 text-purple-600">
                        <FileText className="w-3.5 h-3.5" />
                        {req.requestType}
                      </span>
                    </td>
                    <td className="py-4 px-2 max-w-xs">
                      {req.requestType === "Leave" ? (
                        <div>
                          <p className="font-bold text-[10px]">Dates: {req.startDate} to {req.endDate}</p>
                          <p className="text-muted-foreground text-[10px] italic">{req.reason}</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">{req.reason}</p>
                      )}
                    </td>
                    <td className="py-4 px-2">
                      <span className="block font-medium">Faculty Approved</span>
                      {req.facultyRemarks && (
                        <p className="text-[10px] text-muted-foreground italic">"{req.facultyRemarks}"</p>
                      )}
                    </td>
                    <td className="py-4 px-2">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        req.academicAdminStatus === "Pending" && "bg-amber-500/10 text-amber-600",
                        req.academicAdminStatus === "Approved" && "bg-blue-500/10 text-blue-600",
                        req.academicAdminStatus === "Completed" && "bg-emerald-500/10 text-emerald-600",
                        req.academicAdminStatus === "Rejected" && "bg-rose-500/10 text-rose-600"
                      )}>
                        {req.academicAdminStatus === "Pending" ? "Awaiting Endorsement" : req.academicAdminStatus}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-right space-x-1">
                      {req.academicAdminStatus === "Pending" ? (
                        <button
                          onClick={() => setSelectedReq(req)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] transition cursor-pointer"
                        >
                          Review
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            setRemarks(req.academicAdminRemarks || "");
                          }}
                          className="p-1 rounded bg-secondary text-muted-foreground hover:text-foreground transition cursor-pointer inline-flex items-center"
                          title="View Admin Remarks"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}

                      {/* PDF Generator triggers when admin approves or completes */}
                      {req.requestType !== "Leave" && (req.academicAdminStatus === "Approved" || req.academicAdminStatus === "Completed") && (
                        <>
                          <button
                            onClick={() => handleDownloadPdf(req.id, req.requestType)}
                            className="p-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition cursor-pointer inline-flex items-center"
                            title="Generate & Download Certificate PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {req.academicAdminStatus !== "Completed" && (
                            <button
                              onClick={() => {
                                setSelectedReq(req);
                                setRemarks(req.academicAdminRemarks || "");
                                // Prompt ready for download trigger
                                handleAction("Completed");
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[9px] transition cursor-pointer"
                            >
                              Issue
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold">Review Request #{selectedReq.id}</h3>
                <p className="text-xs text-muted-foreground">Submitted by {selectedReq.studentName} ({selectedReq.studentId})</p>
              </div>
              <button onClick={() => setSelectedReq(null)} className="p-1 rounded hover:bg-muted text-muted-foreground">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-muted/30 p-3 rounded-xl space-y-2 text-xs">
              <p><span className="font-bold text-muted-foreground uppercase text-[10px]">Request Type:</span> {selectedReq.requestType}</p>
              <p><span className="font-bold text-muted-foreground uppercase text-[10px]">Purpose/Reason:</span> {selectedReq.reason}</p>
              <p><span className="font-bold text-muted-foreground uppercase text-[10px]">Faculty Endorsement:</span> {selectedReq.facultyRemarks || "Approved without comments"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Academic Admin Remarks / Comments</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter admin remarks..."
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              {selectedReq.academicAdminStatus === "Pending" && (
                <>
                  <button
                    onClick={() => handleAction("Rejected")}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAction("Approved")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer"
                  >
                    {selectedReq.requestType === "Leave" ? "Approve Leave" : "Approve & Generate PDF"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
