import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  Briefcase,
  ShieldCheck,
  Edit2,
  X,
  Save,
  Loader2,
  BookOpen,
  DoorOpen,
  Clock,
  Heart,
  FileText,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

interface FacultyData {
  id: number;
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  status: string;
  joiningYear: number;
  avatar: string;
  qualification?: string;
  experience?: string;
  subjectsAssigned?: string;
  officeRoom?: string;
  officeHours?: string;
  address?: string;
  bloodGroup?: string;
  joiningDate?: string;
}

export default function FacultyProfile() {
  const { user, refreshProfile, updateUser } = useAuth();
  const [profile, setProfile] = useState<FacultyData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editQualification, setEditQualification] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editSubjects, setEditSubjects] = useState("");
  const [editOfficeRoom, setEditOfficeRoom] = useState("");
  const [editOfficeHours, setEditOfficeHours] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editBloodGroup, setEditBloodGroup] = useState("");
  const [editJoiningDate, setEditJoiningDate] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const max_size = 150;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          
          setEditAvatar(dataUrl);
          setProfile((prev) => (prev ? { ...prev, avatar: dataUrl } : null));
          toast.success("Photo selected. Save changes below to persist.");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/faculty");
      const myProfile = res.data.find((f: FacultyData) => f.email?.toLowerCase().trim() === user?.email?.toLowerCase().trim());
      
      if (myProfile) {
        setProfile(myProfile);
        setEditName(myProfile.name);
        setEditPhone(myProfile.phone || "");
        setEditAvatar(myProfile.avatar || "");
        setEditQualification(myProfile.qualification || "Ph.D. in Software Architecture");
        setEditExperience(myProfile.experience || "12 Years");
        setEditSubjects(myProfile.subjectsAssigned || "Data Structures, Database Systems");
        setEditOfficeRoom(myProfile.officeRoom || "Room 301, LHC Block");
        setEditOfficeHours(myProfile.officeHours || "Mon-Fri 2:00 PM - 4:00 PM");
        setEditAddress(myProfile.address || "Faculty Quarters, CampusHub Uni");
        setEditBloodGroup(myProfile.bloodGroup || "A+");
        setEditJoiningDate(myProfile.joiningDate || "July 15, 2020");
      } else {
        throw new Error("Faculty profile not resolved");
      }
    } catch (err) {
      console.warn("Backend faculty profile unresolved, loading unique fallback", err);
      if (user) {
        const getIndex = () => {
          const match = user.email.match(/faculty(\d+)/i);
          return match ? parseInt(match[1]) : 1;
        };
        const idx = getIndex();
        const fallbackProfile: FacultyData = {
          id: idx,
          name: user.name,
          employeeId: (user as any).employeeId || `EMP-CS-30${idx}`,
          email: user.email,
          phone: `+91 98765 9990${idx - 1}`,
          department: user.department || "Computer Science & Engineering",
          designation: user.title || "Associate Professor",
          status: "Active",
          joiningYear: 2020,
          avatar: user.avatar || "",
          qualification: "Ph.D. in Software Architecture",
          experience: "12 Years",
          subjectsAssigned: "Data Structures, Database Systems",
          officeRoom: `Room 30${idx}, LHC Block`,
          officeHours: "Mon-Fri 2:00 PM - 4:00 PM",
          address: `Room ${idx}0, Faculty Quarters, CampusHub Uni`,
          bloodGroup: "A+",
          joiningDate: "July 15, 2020",
        };
        setProfile(fallbackProfile);
        setEditName(fallbackProfile.name);
        setEditPhone(fallbackProfile.phone || "");
        setEditAvatar(fallbackProfile.avatar || "");
        setEditQualification(fallbackProfile.qualification || "");
        setEditExperience(fallbackProfile.experience || "");
        setEditSubjects(fallbackProfile.subjectsAssigned || "");
        setEditOfficeRoom(fallbackProfile.officeRoom || "");
        setEditOfficeHours(fallbackProfile.officeHours || "");
        setEditAddress(fallbackProfile.address || "");
        setEditBloodGroup(fallbackProfile.bloodGroup || "");
        setEditJoiningDate(fallbackProfile.joiningDate || "");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchProfile();
    }
  }, [user?.email]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setSaving(true);
      const updatedData: FacultyData = {
        ...profile,
        name: editName,
        phone: editPhone,
        avatar: editAvatar,
        qualification: editQualification,
        experience: editExperience,
        subjectsAssigned: editSubjects,
        officeRoom: editOfficeRoom,
        officeHours: editOfficeHours,
        address: editAddress,
        bloodGroup: editBloodGroup,
        joiningDate: editJoiningDate,
      };

      await api.put(`/api/faculty/${profile.id}`, updatedData);
      
      // Refresh context so profile photo/name updates in layout instantly
      updateUser({
        name: editName,
        avatar: editAvatar,
      });
      await refreshProfile();
      
      setProfile(updatedData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error("Error updating profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-muted-foreground font-medium">Resolving profile records...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-card border border-border p-8 rounded-2xl text-center space-y-2 max-w-md mx-auto">
        <p className="font-bold text-foreground">Profile Not Set</p>
        <p className="text-sm text-muted-foreground">
          We could not resolve your faculty record. Check if your account email is registered in the database.
        </p>
      </div>
    );
  }

  const defaultAvatar = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150";

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left pb-12 font-sans">
      {/* Page header */}
      <div className="flex justify-between items-center pb-4 border-b border-border/60">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Faculty Profile</h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal credentials, office allocations, and academic qualifications.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 cursor-pointer active:scale-95 transition-all"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Avatar Card */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="relative group w-32 h-32 mx-auto">
              <img
                src={profile.avatar || defaultAvatar}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = defaultAvatar;
                }}
                alt={profile.name}
                className="w-32 h-32 rounded-full border-4 border-emerald-500/20 object-cover shadow-sm"
              />
              <label className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer select-none">
                <Upload className="w-5 h-5 mb-1" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{profile.name}</h2>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-1">
                {profile.designation}
              </p>
              <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">{profile.department}</p>
            </div>

            <div className="pt-4 border-t border-border/55 w-full flex flex-col gap-2.5 text-xs text-left">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="text-foreground truncate select-all">{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span className="text-foreground select-all">{profile.phone || "Not configured"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="text-foreground leading-normal">{profile.address || "Not configured"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-foreground">Blood Group: <strong>{profile.bloodGroup || "A+"}</strong></span>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50 w-full flex justify-center gap-1.5 select-none">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-pulse">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{profile.status}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Details Form / View */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm md:col-span-2">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <h3 className="font-bold text-lg border-b border-border/50 pb-2 mb-4">Edit Info</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Display Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs text-foreground font-sans"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs text-foreground font-sans"
                  />
                </div>

                {/* Avatar URL */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-muted-foreground uppercase">Profile Photo URL</label>
                  <input
                    type="text"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs text-foreground font-sans"
                  />
                </div>

                {/* Qualification */}
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Qualification</label>
                  <input
                    type="text"
                    value={editQualification}
                    onChange={(e) => setEditQualification(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs text-foreground font-sans"
                  />
                </div>

                {/* Experience */}
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Experience</label>
                  <input
                    type="text"
                    value={editExperience}
                    onChange={(e) => setEditExperience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs text-foreground font-sans"
                  />
                </div>

                {/* Assigned Subjects */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-muted-foreground uppercase">Subjects Assigned</label>
                  <input
                    type="text"
                    value={editSubjects}
                    onChange={(e) => setEditSubjects(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs text-foreground font-sans"
                  />
                </div>

                {/* Office Room Number */}
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Office Room Number</label>
                  <input
                    type="text"
                    value={editOfficeRoom}
                    onChange={(e) => setEditOfficeRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs text-foreground font-sans"
                  />
                </div>

                {/* Office Hours */}
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Office Hours</label>
                  <input
                    type="text"
                    value={editOfficeHours}
                    onChange={(e) => setEditOfficeHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs text-foreground font-sans"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-bold text-muted-foreground uppercase">Residential Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs text-foreground font-sans"
                  />
                </div>

                {/* Blood Group */}
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Blood Group</label>
                  <input
                    type="text"
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs text-foreground font-sans"
                  />
                </div>

                {/* Joining Date */}
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase">Joining Date</label>
                  <input
                    type="text"
                    value={editJoiningDate}
                    onChange={(e) => setEditJoiningDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-xs text-foreground font-sans"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border/50">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer disabled:opacity-70 active:scale-95 transition-all"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(profile.name);
                    setEditPhone(profile.phone || "");
                    setEditAvatar(profile.avatar || "");
                    setEditQualification(profile.qualification || "");
                    setEditExperience(profile.experience || "");
                    setEditSubjects(profile.subjectsAssigned || "");
                    setEditOfficeRoom(profile.officeRoom || "");
                    setEditOfficeHours(profile.officeHours || "");
                    setEditAddress(profile.address || "");
                    setEditBloodGroup(profile.bloodGroup || "");
                    setEditJoiningDate(profile.joiningDate || "");
                  }}
                  disabled={saving}
                  className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground cursor-pointer disabled:opacity-70 active:scale-95 transition-all"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <h3 className="font-bold text-lg border-b border-border/50 pb-2">Employment Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex gap-3 items-center">
                  <div className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground">
                    <Briefcase className="w-4.5 h-4.5 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Employee ID</p>
                    <p className="text-sm font-semibold text-foreground">{profile.employeeId}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground">
                    <Building className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Primary Department</p>
                    <p className="text-sm font-semibold text-foreground">{profile.department}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Joining Date</p>
                    <p className="text-sm font-semibold text-foreground">{profile.joiningDate || "August 1, 2018"}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Qualification</p>
                    <p className="text-sm font-semibold text-foreground">{profile.qualification || "Ph.D. in Computer Science"}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground">
                    <Briefcase className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Experience</p>
                    <p className="text-sm font-semibold text-foreground">{profile.experience || "15 Years"}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground">
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Subjects Assigned</p>
                    <p className="text-sm font-semibold text-foreground">{profile.subjectsAssigned || "CS-301, CS-302"}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground">
                    <DoorOpen className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Office Room Number</p>
                    <p className="text-sm font-semibold text-foreground">{profile.officeRoom || "Room 201, LHC Block"}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Office Hours</p>
                    <p className="text-sm font-semibold text-foreground">{profile.officeHours || "Mon-Wed 10:00 AM - 12:00 PM"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
