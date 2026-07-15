import React, { useState } from "react";
import {
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Plus,
  Search,
  Users,
} from "lucide-react";

export default function PlacementsConsole() {
  const [activeTab, setActiveTab] = useState<"drives" | "companies" | "applications" | "interviews">("drives");

  const stats = [
    { label: "Placed Ratio", value: "84.2%", icon: CheckCircle, color: "text-emerald-600 bg-emerald-500/10" },
    { label: "Total Offers", value: "112 Offers", icon: Users, color: "text-blue-600 bg-blue-500/10" },
    { label: "Average Package", value: "₹12.4 LPA", icon: Briefcase, color: "text-purple-600 bg-purple-500/10" },
  ];

  const drives = [
    { id: 1, company: "Google India", role: "Software Engineer Intern", date: "July 25, 2026", status: "Active", applications: 48 },
    { id: 2, company: "Microsoft", role: "Software Engineer", date: "August 2, 2026", status: "Upcoming", applications: 72 },
    { id: 3, company: "TCS", role: "Systems Engineer", date: "July 12, 2026", status: "Completed", applications: 125 },
  ];

  const companies = [
    { name: "Google", domain: "Technology / Cloud", status: "Tier 1 Partner", packages: "₹32 LPA" },
    { name: "Microsoft", domain: "Software Development", status: "Tier 1 Partner", packages: "₹28 LPA" },
    { name: "Amazon", domain: "E-Commerce", status: "Partner", packages: "₹24 LPA" },
  ];

  const applications = [
    { student: "Kishore Kumar", rollNo: "2023CS1045", company: "Google India", status: "Interviewing" },
    { student: "Jane Smith", rollNo: "2023CS1046", company: "Microsoft", status: "Offered" },
    { student: "Bob Johnson", rollNo: "2023CS1047", company: "Google India", status: "Applied" },
  ];

  const interviews = [
    { student: "Kishore Kumar", round: "Technical Round 1", date: "July 20, 2026", time: "10:00 AM", interviewer: "Google Panel" },
    { student: "Bob Johnson", round: "Coding Assessment", date: "July 22, 2026", time: "02:00 PM", interviewer: "Online Hackerearth" },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto text-left font-sans pb-12">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Placements Console</h1>
          <p className="text-sm text-muted-foreground">
            Manage corporate companies, drive calendars, candidate applications, and interviews.
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-sm font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer select-none">
          <Plus className="w-4 h-4" />
          <span>New Placement Drive</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        {stats.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground uppercase">{metric.label}</p>
                <p className="text-2xl font-extrabold text-foreground">{metric.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${metric.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-border/80 gap-6 text-sm font-bold select-none">
        <button
          onClick={() => setActiveTab("drives")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "drives" ? "border-purple-600 text-purple-600" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Active Drives
        </button>
        <button
          onClick={() => setActiveTab("companies")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "companies" ? "border-purple-600 text-purple-600" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Partners / Companies
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "applications" ? "border-purple-600 text-purple-600" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Student Applications
        </button>
        <button
          onClick={() => setActiveTab("interviews")}
          className={`pb-3 border-b-2 transition-all cursor-pointer ${
            activeTab === "interviews" ? "border-purple-600 text-purple-600" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Interview Scheduling
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {activeTab === "drives" && (
          <div className="divide-y divide-border/60">
            {drives.map((d) => (
              <div key={d.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{d.company}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        d.status === "Active"
                          ? "bg-emerald-500/15 text-emerald-600"
                          : d.status === "Upcoming"
                          ? "bg-amber-500/15 text-amber-600"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{d.role}</p>
                </div>
                <div className="flex items-center gap-8 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span>{d.date}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{d.applications} Candidates</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "companies" && (
          <div className="divide-y divide-border/60">
            {companies.map((c, idx) => (
              <div key={idx} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{c.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.domain}</p>
                </div>
                <div className="text-right text-xs font-bold">
                  <p className="text-foreground">{c.packages}</p>
                  <p className="text-[10px] text-muted-foreground">Max Offered Package</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "applications" && (
          <div className="divide-y divide-border/60">
            {applications.map((app, idx) => (
              <div key={idx} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-bold text-foreground">{app.student}</p>
                  <p className="text-xs text-muted-foreground">Roll No: {app.rollNo} • {app.company}</p>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                    app.status === "Offered"
                      ? "bg-emerald-500/15 text-emerald-600"
                      : app.status === "Interviewing"
                      ? "bg-purple-500/15 text-purple-600"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "interviews" && (
          <div className="divide-y divide-border/60">
            {interviews.map((i, idx) => (
              <div key={idx} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-bold text-foreground">{i.student}</p>
                  <p className="text-xs text-muted-foreground">{i.round} • {i.interviewer}</p>
                </div>
                <div className="flex items-center gap-6 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span>{i.date}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{i.time}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
