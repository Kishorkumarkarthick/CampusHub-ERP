import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  GraduationCap,
  User,
  Shield,
  Sun,
  Moon,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  CheckCircle2,
  Bell,
  CreditCard,
  Calendar,
} from "lucide-react";

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeFeature, setActiveFeature] = useState(0);

  const stats = [
    { label: "Active Students", value: "15,200+", icon: Users, color: "text-blue-500 bg-blue-500/10" },
    { label: "Offered Courses", value: "120+", icon: BookOpen, color: "text-indigo-500 bg-indigo-500/10" },
    { label: "Certified Faculty", value: "480+", icon: Award, color: "text-purple-500 bg-purple-500/10" },
    { label: "Systems SLA Uptime", value: "99.98%", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10" },
  ];

  const features = [
    {
      title: "Real-time Academic Tracking",
      description: "Students can monitor their daily attendance, access lecture notes, review syllabus schedules, and upload assignments with immediate evaluation feedback.",
      details: ["Weekly timetable alerts", "Direct grade book access", "Class attendance tracker"],
      icon: Calendar,
    },
    {
      title: "Streamlined Administration",
      description: "System administrators can manage faculty roles, configure new departments and courses, track financial fee collections, and publish official announcements instantly.",
      details: ["Comprehensive analytics reports", "Department setup wizard", "Instant alert broadcasting"],
      icon: Shield,
    },
    {
      title: "Digital Services & Library",
      description: "Browse digital catalogs, request textbook reservations, and view library borrowing status. Settle tuition fees securely via multiple online payment channels.",
      details: ["Book reservation alerts", "Secure fee invoice payment", "Historical transaction receipts"],
      icon: CreditCard,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans transition-colors duration-300 flex flex-col justify-between">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/40 py-4 px-6 sm:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight">CampusHub ERP</span>
            <span className="block text-[8px] text-muted-foreground font-semibold tracking-wider uppercase">
              One Platform for Smart College Management
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="#features"
            className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#statistics"
            className="hidden md:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Statistics
          </a>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground border border-border/50 shadow-sm transition-all active:scale-95 duration-200 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </nav>

      {/* Hero & Portals Section */}
      <main className="flex-grow">
        {/* Animated Light Background Blobs */}
        <div className="relative overflow-hidden pt-20 pb-16 px-6 sm:px-12">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold tracking-wide">
              <Bell className="w-3.5 h-3.5 animate-bounce" /> Version 2.0.0 Live
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
              Empowering Campus Innovation &amp; Academic Excellence
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One Platform for Smart College Management. Connecting students, professors, and administrative officers through a secure portal experience.
            </p>
          </div>

          {/* Login Gateways Grid */}
          <div className="max-w-5xl mx-auto mt-16 grid md:grid-cols-2 gap-8">
            {/* Student Card */}
            <div className="group relative rounded-2xl border border-border bg-card text-card-foreground p-8 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/15 transition-all duration-300" />
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-6">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Student Portal</h3>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  Log in to track your attendance reports, review current grades, borrow books from the digital catalog library, and view upcoming exam timetables.
                </p>
                <ul className="space-y-2 mb-8">
                  {["Digital Grade Cards", "Attendance Heatmaps", "Assignment Submissions"].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/login?role=student"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 shadow-lg shadow-primary/20 hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                Enter Student Portal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Admin Card */}
            <div className="group relative rounded-2xl border border-border bg-card text-card-foreground p-8 hover:shadow-xl hover:shadow-purple-500/5 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/15 transition-all duration-300" />
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Administrative Hub</h3>
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  Access tools to manage department curriculums, organize course timetables, oversee faculty profiles, view fee transactions, and broadcast notices.
                </p>
                <ul className="space-y-2 mb-8">
                  {["System Config Panel", "Automated Fee Tracker", "Live System Reports"].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/login?role=admin"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 shadow-lg shadow-purple-600/20 hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer"
              >
                Access Admin Portal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <section id="statistics" className="py-20 px-6 sm:px-12 border-t border-border/30 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 space-y-2">
              <h2 className="text-3xl font-extrabold tracking-tight">Trust &amp; Scale</h2>
              <p className="text-sm text-muted-foreground">Real-time system parameters across our unified university grid.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, idx) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-card border border-border/80 flex flex-col items-center text-center space-y-3 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-3xl font-bold tracking-tight">{stat.value}</span>
                    <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Interactive Features Accordion */}
        <section id="features" className="py-20 px-6 sm:px-12 border-t border-border/30">
          <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-12 items-center">
            <div className="md:col-span-2 space-y-4">
              <h2 className="text-3xl font-extrabold tracking-tight">Explore the Ecosystem</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Take a look at how CampusHub ERP integrates various university operations into a single modular solution.
              </p>
              <div className="flex flex-col gap-2 pt-4">
                {features.map((feat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveFeature(idx)}
                    className={`text-left p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      activeFeature === idx
                        ? "bg-primary/5 border-primary/50 text-foreground font-semibold"
                        : "bg-transparent border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {feat.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 p-8 rounded-2xl bg-card border border-border shadow-md min-h-[300px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  {React.createElement(features[activeFeature].icon, {
                    className: "w-8 h-8 text-primary",
                  })}
                  <h3 className="text-xl font-bold">{features[activeFeature].title}</h3>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {features[activeFeature].description}
                </p>
              </div>
              <div className="space-y-2 pt-6 border-t border-border/60">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Included Capabilities</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {features[activeFeature].details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6 sm:px-12 text-center text-xs text-muted-foreground bg-muted/10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <span className="font-bold">CampusHub ERP</span>
          </div>
          <p>&copy; {new Date().getFullYear()} CampusHub ERP. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
