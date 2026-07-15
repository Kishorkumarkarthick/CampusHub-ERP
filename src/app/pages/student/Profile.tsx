import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  CheckCircle,
  Save,
  Loader2,
  Heart,
  Users as UsersIcon,
} from "lucide-react";
import { toast } from "sonner";

interface StudentData {
  id: number;
  name: string;
  rollNo: string;
  email: string;
  phone: string;
  department: string;
  semester: string;
  cgpa: number;
  admissionYear: number;
  avatar: string;
  studentYear?: string;
  section?: string;
  address?: string;
  bloodGroup?: string;
  parentName?: string;
  parentPhone?: string;
}

interface ContactFormInputs {
  name: string;
  phone: string;
  avatar: string;
  address: string;
  bio: string;
  bloodGroup: string;
  emergencyName: string;
  emergencyPhone: string;
}

export default function Profile() {
  const { user, refreshProfile, updateUser } = useAuth();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local storage backups for bio
  const [bio, setBio] = useState(() => {
    const saved = localStorage.getItem("erp_student_bio");
    return saved || "Pre-Final Computer Science undergrad student enthusiastic about software architectures and AI integrations.";
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContactFormInputs>();

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/students");
      const myRecord = res.data.find((s: StudentData) => s.email === user?.email);
      
      if (myRecord) {
        setStudent(myRecord);
        // Set form defaults
        setValue("name", myRecord.name);
        setValue("phone", myRecord.phone || "");
        setValue("avatar", myRecord.avatar || "");
        setValue("address", myRecord.address || "123 Campus Boulevard, Block B, CampusHub Uni");
        setValue("bio", bio);
        setValue("bloodGroup", myRecord.bloodGroup || "O+");
        setValue("emergencyName", myRecord.parentName || "Parent Name");
        setValue("emergencyPhone", myRecord.parentPhone || "+91 98765 00000");
      } else {
        throw new Error("Student not found in list");
      }
    } catch (err) {
      console.warn("Backend student profile unresolved, loading unique fallback", err);
      if (user) {
        const getIndex = () => {
          const match = user.email.match(/student(\d+)/i);
          return match ? parseInt(match[1]) : 1;
        };
        const idx = getIndex();
        const fallbackRecord: StudentData = {
          id: idx,
          name: user.name,
          rollNo: user.rollNo || `CH2026CS${1000 + idx}`,
          email: user.email,
          phone: `+91 98765 0000${idx}`,
          department: user.department || "Computer Science & Engineering",
          semester: user.semester || "5th Semester",
          cgpa: Number((8.2 + idx * 0.15).toFixed(2)),
          admissionYear: 2023,
          avatar: user.avatar || "",
          studentYear: "3rd Year",
          section: "Section A",
          address: `${idx}23 Campus Boulevard, Block B, CampusHub Uni`,
          bloodGroup: "O+",
          parentName: `Parent of Student ${idx}`,
          parentPhone: `+91 98765 0000${idx - 1}`,
        };
        setStudent(fallbackRecord);
        setValue("name", fallbackRecord.name);
        setValue("phone", fallbackRecord.phone);
        setValue("avatar", fallbackRecord.avatar || "");
        setValue("address", fallbackRecord.address || "");
        setValue("bio", bio);
        setValue("bloodGroup", fallbackRecord.bloodGroup || "");
        setValue("emergencyName", fallbackRecord.parentName || "");
        setValue("emergencyPhone", fallbackRecord.parentPhone || "");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchStudentProfile();
    }
  }, [user?.email]);

  const onSubmit = async (data: ContactFormInputs) => {
    if (!student) return;

    try {
      setSaving(true);
      
      // Update core database fields
      const updatedDBRecord = {
        ...student,
        name: data.name,
        phone: data.phone,
        avatar: data.avatar,
        address: data.address,
        bloodGroup: data.bloodGroup,
        parentName: data.emergencyName,
        parentPhone: data.emergencyPhone,
      };

      await api.put(`/api/students/${student.id}`, updatedDBRecord);

      // Save bio locally
      setBio(data.bio);
      localStorage.setItem("erp_student_bio", data.bio);

      // Refresh Auth Context to apply photo/name modifications instantly
      updateUser({
        name: data.name,
        avatar: data.avatar,
      });
      await refreshProfile();
      
      setStudent(updatedDBRecord);
      toast.success("Profile records updated successfully!");
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm text-muted-foreground font-medium">Resolving student profile...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="bg-card border border-border p-8 rounded-2xl text-center space-y-2 max-w-md mx-auto">
        <p className="font-bold text-foreground">Profile Not Available</p>
        <p className="text-sm text-muted-foreground">
          We could not resolve your student record. Ensure this account has been registered correctly.
        </p>
      </div>
    );
  }

  const defaultAvatar = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150";

  return (
    <div className="space-y-6 font-sans pb-12 text-left">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Student Profile</h1>
        <p className="text-sm text-muted-foreground">
          View your academic registers, check semester details, and modify contact demographics.
        </p>
      </div>

      {/* Main Grid split */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Left Column: Avatar Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-4 shadow-sm relative overflow-hidden select-none">
            <div className="absolute top-0 inset-x-0 h-2 bg-indigo-600" />
            <img
              src={student.avatar || defaultAvatar}
              onError={(e) => {
                (e.target as HTMLImageElement).src = defaultAvatar;
              }}
              alt={student.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-card mx-auto shadow-md"
            />
            <div>
              <h3 className="text-xl font-bold text-foreground">{student.name}</h3>
              <p className="text-xs text-muted-foreground font-mono font-bold mt-0.5">{student.rollNo}</p>
              <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-3">
                Active Student
              </span>
            </div>

            <p className="text-xs text-muted-foreground italic leading-relaxed py-2 max-w-xs mx-auto">
              "{bio}"
            </p>

            <div className="border-t border-border/40 pt-4 text-left text-xs space-y-2.5">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-foreground truncate select-all">{student.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-foreground select-all">{student.phone || "Not configured"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-foreground leading-normal">{student.address || "Not configured"}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-foreground leading-normal">Blood Group: <strong>{student.bloodGroup || "O+"}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Academic Indices & Contact Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Profile summary cards */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/40 pb-3 select-none">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <span>Academic Register</span>
            </h3>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 select-none">
              <div className="p-4 rounded-xl bg-secondary/40 border border-border/50 text-center">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">CGPA</span>
                <span className="text-lg font-extrabold text-foreground mt-1 block">
                  {student.cgpa ? student.cgpa.toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-secondary/40 border border-border/50 text-center">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Semester</span>
                <span className="text-lg font-extrabold text-foreground mt-1 block">{student.semester}</span>
              </div>
              <div className="p-4 rounded-xl bg-secondary/40 border border-border/50 text-center">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Year</span>
                <span className="text-lg font-extrabold text-foreground mt-1 block">{student.studentYear || "3rd Year"}</span>
              </div>
              <div className="p-4 rounded-xl bg-secondary/40 border border-border/50 text-center">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Section</span>
                <span className="text-lg font-extrabold text-foreground mt-1 block">{student.section || "A"}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed pt-2">
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Department Stream:</span>
                <strong className="font-bold text-foreground">{student.department}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Advising Professor:</span>
                <strong className="font-semibold text-foreground">Prof. Saradha Krishnan (CSE)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Admission Year:</span>
                <strong className="font-semibold text-foreground">{student.admissionYear}</strong>
              </div>
            </div>
          </div>

          {/* Parent Details Card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/40 pb-3 select-none">
              <UsersIcon className="w-5 h-5 text-indigo-600" />
              <span>Parent Details</span>
            </h3>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Parent / Guardian Name:</span>
                <strong className="font-bold text-foreground">{student.parentName || "Homer Simpson"}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-border/30">
                <span className="text-muted-foreground">Parent Contact Number:</span>
                <strong className="font-semibold text-foreground">{student.parentPhone || "+1 (555) 019-9021"}</strong>
              </div>
            </div>
          </div>

          {/* Contact Details Form Card */}
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/40 pb-3 select-none">
              <User className="w-5 h-5 text-indigo-600" />
              <span>Update Details Form</span>
            </h3>

            {Object.keys(errors).length > 0 && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[11px] space-y-0.5 font-medium">
                <p className="font-bold">Form Input Alerts:</p>
                {errors.name && <p>• {errors.name.message}</p>}
                {errors.phone && <p>• {errors.phone.message}</p>}
                {errors.avatar && <p>• {errors.avatar.message}</p>}
                {errors.address && <p>• {errors.address.message}</p>}
                {errors.bio && <p>• {errors.bio.message}</p>}
                {errors.bloodGroup && <p>• {errors.bloodGroup.message}</p>}
                {errors.emergencyName && <p>• {errors.emergencyName.message}</p>}
                {errors.emergencyPhone && <p>• {errors.emergencyPhone.message}</p>}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-foreground font-sans"
                    {...register("name", { required: "Name is required" })}
                  />
                </div>

                {/* Mobile Phone */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Mobile Phone</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-foreground font-sans"
                    {...register("phone", { required: "Mobile phone number is required" })}
                  />
                </div>

                {/* Profile Photo URL */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Profile Photo Avatar URL</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-foreground font-sans"
                    {...register("avatar", { required: "Avatar URL is required" })}
                  />
                </div>

                {/* Blood Group */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Blood Group</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-foreground font-sans"
                    {...register("bloodGroup", { required: "Blood group is required" })}
                  />
                </div>

                {/* Home Address */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-muted-foreground">Residential Address</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-foreground font-sans"
                    {...register("address", { required: "Residential address is required" })}
                  />
                </div>
              </div>

              {/* Bio summary */}
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Personal Bio Summary</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-foreground resize-none leading-relaxed font-sans"
                  {...register("bio", { required: "Bio summary statement is required" })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/40 pt-4">
                {/* Emergency contact name */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Parent / Guardian Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-foreground font-sans"
                    {...register("emergencyName", { required: "Parent/Guardian name is required" })}
                  />
                </div>

                {/* Emergency contact phone */}
                <div className="space-y-1">
                  <label className="font-semibold text-muted-foreground">Parent Contact Phone</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs text-foreground font-sans"
                    {...register("emergencyPhone", { required: "Parent phone number is required" })}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/10 hover:shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Update Contact Details</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
