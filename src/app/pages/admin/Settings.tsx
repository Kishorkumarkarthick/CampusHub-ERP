import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Shield,
  Mail,
  Building,
  Save,
  CheckCircle,
  FileText,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const { user, refreshProfile, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "Administrator");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [title, setTitle] = useState(user?.title || "Academic Director");
  const [saving, setSaving] = useState(false);

  const subRole = user?.subRole || (
    user?.email?.toLowerCase().includes("academic") ? "academic" :
    user?.email?.toLowerCase().includes("finance") ? "finance" :
    user?.email?.toLowerCase().includes("library") ? "library" :
    user?.email?.toLowerCase().includes("placement") ? "placement" :
    "super"
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Simulate save delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      updateUser({
        name,
        avatar,
        title,
      });
      await refreshProfile();
      toast.success("Administrator profile settings saved successfully!");
    } catch (err) {
      toast.error("Failed to update profile settings.");
    } finally {
      setSaving(false);
    }
  };

  const getScope = () => {
    switch (subRole) {
      case "academic":
        return "Academics, Students, Course Curriculum & Schedules";
      case "finance":
        return "Fee Invoices, Receipts, and Financial Audits";
      case "library":
        return "Books Inventory, Fine collections, Borrows & Returns";
      case "placement":
        return "Placement Drives, Applications, and Interviews";
      case "super":
      default:
        return "Global Administrative Authority";
    }
  };

  const defaultAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150";

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left font-sans pb-12">
      {/* Title Header */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Profile Settings</h1>
        <p className="text-sm text-muted-foreground">
          View your administrative scope, update display names, and configure custom avatars.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4 h-fit">
          <img
            src={avatar || defaultAvatar}
            onError={(e) => {
              (e.target as HTMLImageElement).src = defaultAvatar;
            }}
            alt={name}
            className="w-28 h-28 rounded-full border-4 border-purple-500/20 object-cover shadow-sm"
          />
          <div>
            <h2 className="text-lg font-bold text-foreground">{name}</h2>
            <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider mt-1">
              {title}
            </p>
            <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Administration</p>
          </div>

          <div className="pt-4 border-t border-border/50 w-full flex justify-center gap-1.5 select-none">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600/10 text-purple-600 dark:text-purple-400 text-xs font-bold capitalize">
              <Shield className="w-3.5 h-3.5" />
              <span>{subRole} Admin</span>
            </span>
          </div>
        </div>

        {/* Profile Edit Fields */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <h3 className="font-bold text-lg border-b border-border/50 pb-2 mb-4">Edit Profile details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                  required
                />
              </div>

              {/* Title / Designation */}
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Designation / Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                  required
                />
              </div>

              {/* Profile Photo URL */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-muted-foreground uppercase">Profile Photo URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-xs text-foreground font-sans"
                />
              </div>

              {/* Read Only Fields */}
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">Corporate Email</label>
                <input
                  type="text"
                  value={user?.email || ""}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-secondary/50 text-muted-foreground focus:outline-none text-xs font-sans cursor-not-allowed select-all"
                  disabled
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase">System Authority</label>
                <input
                  type="text"
                  value={user?.role?.toUpperCase() || "ADMIN"}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-secondary/50 text-muted-foreground focus:outline-none text-xs font-sans cursor-not-allowed uppercase"
                  disabled
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-bold text-muted-foreground uppercase">Assigned Authority Scope</label>
                <textarea
                  value={getScope()}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-secondary/50 text-muted-foreground focus:outline-none text-xs font-sans cursor-not-allowed resize-none leading-normal"
                  disabled
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border/50">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer disabled:opacity-70 active:scale-95 transition-all"
              >
                {saving ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
