import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Download, FileSpreadsheet, FileText, Calendar, Filter, Users, GraduationCap, CheckCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedSem, setSelectedSem] = useState("All");
  const [activeTab, setActiveTab] = useState<"attendance" | "fees" | "results" | "demographics">("attendance");

  // Sample seed data to match database records
  const attendanceData = [
    { name: "CSE", rate: 89, target: 75 },
    { name: "ECE", rate: 84, target: 75 },
    { name: "ME", rate: 78, target: 75 },
  ];

  const feesData = [
    { name: "Tuition Fees", collected: 95000, outstanding: 12000 },
    { name: "Hostel Fees", collected: 32000, outstanding: 8000 },
    { name: "Library Fees", collected: 18000, outstanding: 4000 },
  ];

  const resultsData = [
    { grade: "A+ Grade", count: 28 },
    { grade: "A Grade", count: 64 },
    { grade: "B Grade", count: 52 },
    { grade: "C Grade", count: 22 },
    { grade: "Fail", count: 6 },
  ];

  const demographicsData = [
    { dept: "CSE", Students: 240, Faculty: 18 },
    { dept: "ECE", Students: 180, Faculty: 14 },
    { dept: "ME", Students: 150, Faculty: 13 },
  ];

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const handleExportCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Category,Parameter,Value 1,Value 2\r\n";

      // Append Attendance
      attendanceData.forEach((d) => {
        csvContent += `Attendance,${d.name},${d.rate}%,Target ${d.target}%\r\n`;
      });
      // Append Fees
      feesData.forEach((d) => {
        csvContent += `Fees,${d.name},Collected ₹${d.collected},Outstanding ₹${d.outstanding}\r\n`;
      });
      // Append Results
      resultsData.forEach((d) => {
        csvContent += `Results,${d.grade},${d.count} candidates,\r\n`;
      });
      // Append Demographics
      demographicsData.forEach((d) => {
        csvContent += `Demographics,${d.dept},Students ${d.Students},Faculty ${d.Faculty}\r\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `CampusHub_ERP_Report_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV/Excel sheet downloaded successfully!");
    } catch (err) {
      console.error("CSV export failed", err);
      toast.error("Failed to export spreadsheet ledger.");
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans text-left pb-12 max-w-6xl mx-auto print:p-0">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Reports &amp; Analytics</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Monitor attendance parameters, fee summaries, grading distributions, and demographic trends.
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl border border-border bg-card hover:bg-secondary/40 text-muted-foreground hover:text-foreground text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export to Excel</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filter and Actions (Hidden on Print) */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card border border-border p-4 rounded-2xl shadow-sm print:hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground select-none">
          <Filter className="w-4 h-4 text-purple-600" />
          <span>Filters:</span>
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Dept</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-input-background text-xs font-sans focus:outline-none"
            >
              <option value="All">All Departments</option>
              <option value="CSE">Computer Science</option>
              <option value="ECE">Electronics &amp; Comm</option>
              <option value="ME">Mechanical Eng</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Semester</span>
            <select
              value={selectedSem}
              onChange={(e) => setSelectedSem(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-input-background text-xs font-sans focus:outline-none"
            >
              <option value="All">All Semesters</option>
              <option value="1">1st Semester</option>
              <option value="3">3rd Semester</option>
              <option value="5">5th Semester</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Avg Attendance", value: "84.2%", desc: "Target rate: 75%", icon: CheckCircle, color: "text-emerald-600 bg-emerald-600/10" },
          { title: "Fee Collection", value: "85.8%", desc: "₹145K collected / ₹169K", icon: CreditCard, color: "text-indigo-600 bg-indigo-600/10" },
          { title: "Student Pass Rate", value: "96.4%", desc: "6 Fail cases audited", icon: GraduationCap, color: "text-purple-600 bg-purple-600/10" },
          { title: "Staff to Student", value: "1:12", desc: "45 Faculty / 570 Students", icon: Users, color: "text-amber-600 bg-amber-600/10" },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-card border border-border p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{item.title}</p>
                <p className="text-2xl font-extrabold text-foreground tracking-tight leading-none">{item.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{item.desc}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Area */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Chart tabs selector */}
        <div className="flex border-b border-border select-none overflow-x-auto print:hidden bg-secondary/10">
          {[
            { id: "attendance", label: "Attendance Analysis" },
            { id: "fees", label: "Financial Audits" },
            { id: "results", label: "Grade Distributions" },
            { id: "demographics", label: "Demographics Statistics" },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 px-5 text-xs font-bold border-b-2 tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "border-purple-600 text-purple-600 bg-background"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Chart displays */}
        <div className="p-6">
          <div className="h-80 w-full">
            {activeTab === "attendance" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="rate" name="Average Rate (%)" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                  <Bar dataKey="target" name="Required Minimum (%)" fill="#ef4444" radius={[8, 8, 0, 0]} barSize={20} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeTab === "fees" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={feesData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="collected" name="Amount Collected (₹)" fill="#10b981" radius={[8, 8, 0, 0]} barSize={35} />
                  <Bar dataKey="outstanding" name="Outstanding Dues (₹)" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeTab === "results" && (
              <div className="flex flex-col sm:flex-row h-full items-center justify-around gap-6">
                <div className="w-full sm:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={resultsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {resultsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 select-none w-full sm:w-1/3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Grade Distribution Ledger</p>
                  {resultsData.map((d, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="font-semibold text-muted-foreground">{d.grade}</span>
                      </div>
                      <span className="font-extrabold text-foreground">{d.count} candidates</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "demographics" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographicsData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="dept" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Students" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={30} />
                  <Bar dataKey="Faculty" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
