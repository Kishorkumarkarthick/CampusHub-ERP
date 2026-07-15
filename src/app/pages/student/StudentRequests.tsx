import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api, { API_BASE_URL } from "../../services/api";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Paperclip,
  CheckCircle2,
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

export default function StudentRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Leave" | "Bonafide" | "Marksheet">("Leave");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Form states
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attachment, setAttachment] = useState("");
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit states
  const [editingRequest, setEditingRequest] = useState<RequestItem | null>(null);

  const fetchRequests = async () => {
    if (!user?.rollNo) return;
    try {
      setLoading(true);
      const res = await api.get(`/api/requests/student/${user.rollNo}`);
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [user?.rollNo]);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMsg("Please specify a reason or purpose");
      return;
    }
    if (activeTab === "Leave" && (!startDate || !endDate)) {
      setErrorMsg("Please select start and end dates");
      return;
    }

    try {
      setErrorMsg(null);
      const payload = {
        studentId: user?.rollNo,
        studentName: user?.name,
        department: user?.department,
        semester: user?.semester || "5th Semester",
        requesterEmail: user?.email,
        reason,
        attachment,
        ...(activeTab === "Leave" && { startDate, endDate }),
      };

      if (editingRequest) {
        await api.put(
          `/api/requests/${editingRequest.requestType.toLowerCase()}/${editingRequest.id}/edit`,
          null,
          {
            params: { reason, attachment },
          }
        );
        setSuccessMsg("Request updated successfully!");
        setEditingRequest(null);
      } else {
        const endpoint = `/api/requests/${activeTab.toLowerCase()}`;
        await api.post(endpoint, payload);
        setSuccessMsg("Request submitted successfully!");
      }

      setReason("");
      setStartDate("");
      setEndDate("");
      setAttachment("");
      fetchRequests();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data || "Failed to submit request");
    }
  };

  const handleEdit = (req: RequestItem) => {
    setEditingRequest(req);
    setActiveTab(req.requestType);
    setReason(req.reason);
    if (req.requestType === "Leave") {
      setStartDate(req.startDate || "");
      setEndDate(req.endDate || "");
    }
    setAttachment(req.attachment || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = async (id: number, type: string) => {
    if (!window.confirm("Are you sure you want to cancel this request?")) return;
    try {
      await api.delete(`/api/requests/${type.toLowerCase()}/${id}`);
      setSuccessMsg("Request cancelled successfully");
      fetchRequests();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setErrorMsg("Failed to cancel request");
    }
  };

  const handleDownloadPdf = (id: number, type: string) => {
    const downloadUrl = `${API_BASE_URL}/api/requests/${type.toLowerCase()}/${id}/pdf`;
    window.open(downloadUrl, "_blank");
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch = (r.reason || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (r.requestType || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || r.finalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "Faculty Approved":
      case "Academic Admin Approved":
        return <CheckCircle2 className="w-4 h-4 text-indigo-500" />;
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "Rejected":
        return <XCircle className="w-4 h-4 text-rose-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Card calculation helper values
  const pendingCount = requests.filter(r => r.finalStatus === "Pending" || r.finalStatus === "Faculty Approved").length;
  const approvedCount = requests.filter(r => r.finalStatus === "Completed" || r.finalStatus === "Academic Admin Approved").length;
  const rejectedCount = requests.filter(r => r.finalStatus === "Rejected").length;
  const certificatesReady = requests.filter(r => r.finalStatus === "Completed" && r.requestType !== "Leave").length;

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Request Management</h1>
          <p className="text-sm text-muted-foreground">Apply for leaves, certificates, or transcripts and track approval history.</p>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Pending Requests</p>
            <p className="text-xl font-bold">{pendingCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Approved / Processing</p>
            <p className="text-xl font-bold">{approvedCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Rejected Requests</p>
            <p className="text-xl font-bold">{rejectedCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Certificates Ready</p>
            <p className="text-xl font-bold">{certificatesReady}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Create request + History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Create Request panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
            <h2 className="text-base font-bold mb-4">{editingRequest ? "Edit Active Request" : "New Request Application"}</h2>

            {/* Request Type Selector Tabs */}
            <div className="flex bg-muted/60 p-1 rounded-xl mb-4 text-xs font-semibold">
              {(["Leave", "Bonafide", "Marksheet"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    if (!editingRequest) setActiveTab(tab);
                  }}
                  className={cn(
                    "flex-grow py-2 rounded-lg text-center transition-all cursor-pointer",
                    activeTab === tab 
                      ? "bg-indigo-600 text-white shadow" 
                      : "text-muted-foreground hover:text-foreground",
                    editingRequest && activeTab !== tab && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {activeTab === "Leave" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase mb-1 block">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase mb-1 block">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase mb-1 block">
                  {activeTab === "Leave" ? "Reason for Leave" : activeTab === "Bonafide" ? "Purpose of Bonafide Certificate" : "Purpose of Marksheet Request"}
                </label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={activeTab === "Leave" ? "State reason for your leave request..." : "E.g., for bus pass, passport application, internship submission..."}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase mb-1 block">Supporting URL / Attachment (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={attachment}
                    onChange={(e) => setAttachment(e.target.value)}
                    placeholder="Attachment Link or filename"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                  <div className="p-2 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                    <Paperclip className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl transition cursor-pointer text-xs"
                >
                  {editingRequest ? "Save Updates" : "Submit Application"}
                </button>
                {editingRequest && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRequest(null);
                      setReason("");
                      setStartDate("");
                      setEndDate("");
                      setAttachment("");
                    }}
                    className="bg-secondary hover:bg-secondary/80 text-foreground font-semibold px-3 py-2 rounded-xl transition cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Requests History List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-base font-bold">My Request History</h2>
              
              {/* Search & Filter Controls */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search requests..."
                    className="pl-9 pr-4 py-1.5 w-full bg-muted/40 border border-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 bg-muted/40 border border-border rounded-xl text-xs focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Faculty Approved">Faculty Approved</option>
                    <option value="Academic Admin Approved">Admin Approved</option>
                    <option value="Completed">Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground">Loading requests...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground border border-dashed border-border rounded-2xl">
                No request applications found matching filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                      <th className="py-3 px-2">Type</th>
                      <th className="py-3 px-2">Applied Date</th>
                      <th className="py-3 px-2">Purpose / Duration</th>
                      <th className="py-3 px-2">Approval Flow Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((req) => (
                      <tr key={`${req.requestType}-${req.id}`} className="border-b border-border/50 text-xs hover:bg-muted/10">
                        <td className="py-4 px-2 font-bold flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          {req.requestType}
                        </td>
                        <td className="py-4 px-2 text-muted-foreground">
                          {req.createdDate ? req.createdDate.split(" ")[0] : "N/A"}
                        </td>
                        <td className="py-4 px-2 max-w-xs truncate">
                          {req.requestType === "Leave" ? (
                            <span>
                              {req.startDate} to {req.endDate}
                              <span className="block text-[10px] text-muted-foreground font-medium italic mt-0.5">
                                Reason: {req.reason}
                              </span>
                            </span>
                          ) : (
                            <span>{req.reason}</span>
                          )}
                        </td>
                        <td className="py-4 px-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-bold">
                              {getStatusIcon(req.finalStatus)}
                              <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded",
                                req.finalStatus === "Pending" && "bg-amber-500/10 text-amber-600",
                                req.finalStatus === "Faculty Approved" && "bg-blue-500/10 text-blue-600",
                                req.finalStatus === "Academic Admin Approved" && "bg-purple-500/10 text-purple-600",
                                req.finalStatus === "Completed" && "bg-emerald-500/10 text-emerald-600",
                                req.finalStatus === "Rejected" && "bg-rose-500/10 text-rose-600"
                              )}>
                                {req.finalStatus}
                              </span>
                            </div>
                            
                            {/* Detailed tooltips / remarks inside history */}
                            {req.facultyRemarks && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[150px]" title={req.facultyRemarks}>
                                <span className="font-bold">Faculty:</span> {req.facultyRemarks}
                              </p>
                            )}
                            {req.academicAdminRemarks && (
                              <p className="text-[10px] text-muted-foreground truncate max-w-[150px]" title={req.academicAdminRemarks}>
                                <span className="font-bold">Admin:</span> {req.academicAdminRemarks}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2 text-right space-x-1.5">
                          {req.finalStatus === "Pending" && (
                            <>
                              <button
                                onClick={() => handleEdit(req)}
                                className="p-1 rounded bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 transition cursor-pointer"
                                title="Edit Application"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleCancel(req.id, req.requestType)}
                                className="p-1 rounded bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition cursor-pointer"
                                title="Cancel Request"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {req.finalStatus === "Completed" && req.requestType !== "Leave" && (
                            <button
                              onClick={() => handleDownloadPdf(req.id, req.requestType)}
                              className="p-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold px-2"
                              title="Download Signed PDF Document"
                            >
                              <Download className="w-3.5 h-3.5" /> Certificate
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
        </div>

      </div>
    </div>
  );
}
