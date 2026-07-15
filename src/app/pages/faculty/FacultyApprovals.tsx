import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  ClipboardCheck,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  FileText,
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

export default function FacultyApprovals() {
  const { user } = useAuth();
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
    if (!user?.department) return;
    try {
      setLoading(true);
      const res = await api.get(`/api/requests/faculty/${encodeURIComponent(user.department)}`);
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch department requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.department]);

  const handleAction = async (status: "Approved" | "Rejected") => {
    if (!selectedReq) return;
    try {
      setErrorMsg(null);
      await api.put(
        `/api/requests/${selectedReq.requestType.toLowerCase()}/${selectedReq.id}/faculty`,
        null,
        {
          params: { status, remarks },
        }
      );
      setSuccessMsg(`Request successfully ${status === "Approved" ? "approved/forwarded" : "rejected"}!`);
      setSelectedReq(null);
      setRemarks("");
      fetchRequests();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg("Failed to update request status");
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch = (r.studentName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.studentId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.reason || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "All" || r.requestType === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate metrics
  const pendingCount = requests.filter((r) => r.facultyStatus === "Pending").length;
  const approvedToday = requests.filter(
    (r) => r.facultyStatus === "Approved" && r.updatedDate && r.updatedDate.startsWith(new Date().toISOString().split("T")[0])
  ).length;
  const rejectedToday = requests.filter(
    (r) => r.facultyStatus === "Rejected" && r.updatedDate && r.updatedDate.startsWith(new Date().toISOString().split("T")[0])
  ).length;

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Request Approvals Panel</h1>
        <p className="text-sm text-muted-foreground">Manage and endorse leave applications, bonafide requests, and transcript clearances for department students.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Pending Approvals</p>
            <p className="text-xl font-bold">{pendingCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Approved / Forwarded Today</p>
            <p className="text-xl font-bold">{approvedToday}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Rejected Today</p>
            <p className="text-xl font-bold">{rejectedToday}</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl flex items-center gap-2 text-xs">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Requests Directory */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-base font-bold">Applications list (Department: {user?.department})</h2>
          
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students..."
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
          <div className="py-12 text-center text-xs text-muted-foreground">Loading student applications...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
            No student request applications currently pending for your department.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                  <th className="py-3 px-2">Student</th>
                  <th className="py-3 px-2">Request Type</th>
                  <th className="py-3 px-2">Reason / Details</th>
                  <th className="py-3 px-2">Faculty Status</th>
                  <th className="py-3 px-2">Admin Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={`${req.requestType}-${req.id}`} className="border-b border-border/50 hover:bg-muted/10">
                    <td className="py-4 px-2">
                      <p className="font-bold">{req.studentName}</p>
                      <p className="text-[10px] text-muted-foreground">{req.studentId} | {req.semester}</p>
                    </td>
                    <td className="py-4 px-2 font-semibold">
                      <span className="flex items-center gap-1.5 text-indigo-600">
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
                      {req.attachment && (
                        <a href={req.attachment} target="_blank" rel="noreferrer" className="text-[10px] text-indigo-500 hover:underline block mt-1">
                          View Attachment
                        </a>
                      )}
                    </td>
                    <td className="py-4 px-2">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        req.facultyStatus === "Pending" && "bg-amber-500/10 text-amber-600",
                        req.facultyStatus === "Approved" && "bg-emerald-500/10 text-emerald-600",
                        req.facultyStatus === "Rejected" && "bg-rose-500/10 text-rose-600"
                      )}>
                        {req.facultyStatus}
                      </span>
                    </td>
                    <td className="py-4 px-2 text-muted-foreground text-[10px]">
                      {req.academicAdminStatus === "Pending" ? "Awaiting Faculty endorsement" : req.academicAdminStatus}
                    </td>
                    <td className="py-4 px-2 text-right">
                      {req.facultyStatus === "Pending" ? (
                        <button
                          onClick={() => setSelectedReq(req)}
                          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] transition cursor-pointer"
                        >
                          Review & Endorse
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            setRemarks(req.facultyRemarks || "");
                          }}
                          className="p-1 rounded bg-secondary text-muted-foreground hover:text-foreground transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
              {selectedReq.requestType === "Leave" && (
                <p><span className="font-bold text-muted-foreground uppercase text-[10px]">Dates:</span> {selectedReq.startDate} to {selectedReq.endDate}</p>
              )}
              <p><span className="font-bold text-muted-foreground uppercase text-[10px]">Reason:</span> {selectedReq.reason}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase">Faculty Remarks / Comments</label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks or approval reason..."
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
              {selectedReq.facultyStatus === "Pending" && (
                <>
                  <button
                    onClick={() => handleAction("Rejected")}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition cursor-pointer"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleAction("Approved")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition cursor-pointer flex items-center gap-1"
                  >
                    Approve & Forward <ArrowRight className="w-3.5 h-3.5" />
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
