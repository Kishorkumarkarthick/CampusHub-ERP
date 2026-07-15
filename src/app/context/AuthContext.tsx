import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin" | "faculty";
  subRole?: "super" | "academic" | "finance" | "library" | "placement";
  department?: string;
  avatar?: string;
  rollNo?: string;
  semester?: string;
  title?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: "student" | "admin" | "faculty") => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  impersonate: (user: User) => void;
}

const SOUTH_INDIAN_STUDENTS = [
  "Adithya Krishnan",
  "Rajesh Kannan",
  "Sanjay Srinivasan",
  "Meera Nair",
  "Divya Pillai",
  "Priya Sundaram",
  "Hari Prasath",
  "Karthik Raja",
  "Ganesh Venkat",
  "Balaji Viswanathan"
];

const SOUTH_INDIAN_FACULTY = [
  "Dr. Padmanabhan Nair",
  "Dr. Meenakshi Sundaram",
  "Dr. Venkatasubramanian",
  "Dr. Srinivasan Ramasamy",
  "Dr. Soundararajan",
  "Prof. Swaminathan",
  "Dr. Chidambaram Raman",
  "Dr. Ranganathan Iyer",
  "Prof. Kalyanasundaram",
  "Dr. Gayatri Venkataraman"
];

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  "student@college.edu": {
    password: "password123",
    user: { id: "s1", name: "Kishore Kumar", email: "student@college.edu", role: "student", department: "Computer Science & Engineering", rollNo: "2023CS1045", semester: "5th Semester", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150" },
  },
  "faculty@college.edu": {
    password: "password123",
    user: { id: "f1", name: "Dr. Saradha Krishnan", email: "faculty@college.edu", role: "faculty", department: "Computer Science & Engineering", title: "Associate Professor", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
  },
  "admin@college.edu": {
    password: "password123",
    user: { id: "a1", name: "Dr. Aravind Swamy", email: "admin@college.edu", role: "admin", subRole: "super", department: "Administration", title: "Academic Director", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
  },
  "superadmin@campushub.edu": {
    password: "password123",
    user: { id: "a_super", name: "Senthil Kumar", email: "superadmin@campushub.edu", role: "admin", subRole: "super", department: "Administration", title: "Super Administrator", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
  },
  "academic@campushub.edu": {
    password: "password123",
    user: { id: "a_acad", name: "Anantha Krishnan", email: "academic@campushub.edu", role: "admin", subRole: "academic", department: "Administration", title: "Academic Administrator", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
  },
  "finance@campushub.edu": {
    password: "password123",
    user: { id: "a_fin", name: "Ranganathan Iyer", email: "finance@campushub.edu", role: "admin", subRole: "finance", department: "Administration", title: "Finance Administrator", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
  },
  "library@campushub.edu": {
    password: "password123",
    user: { id: "a_lib", name: "Madhavan Pillai", email: "library@campushub.edu", role: "admin", subRole: "library", department: "Administration", title: "Library Administrator", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
  },
  "placement@campushub.edu": {
    password: "password123",
    user: { id: "a_place", name: "Palanisamy Gounder", email: "placement@campushub.edu", role: "admin", subRole: "placement", department: "Administration", title: "Placement Officer", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" },
  },
};

// Programmatically seed student1@campushub.edu through student10@campushub.edu in local DEMO_USERS fallback
for (let i = 1; i <= 10; i++) {
  const email = `student${i}@campushub.edu`;
  const rollNo = `CH2026CS${1000 + i}`;
  DEMO_USERS[email] = {
    password: `student${i}@123`,
    user: {
      id: `s_demo_${i}`,
      name: SOUTH_INDIAN_STUDENTS[i - 1] || `Student ${i}`,
      email: email,
      role: "student",
      department: "Computer Science & Engineering",
      rollNo: rollNo,
      semester: "5th Semester",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
      title: "3rd Year",
    },
  };
}

// Programmatically seed faculty1@campushub.edu through faculty10@campushub.edu in local DEMO_USERS fallback
for (let i = 1; i <= 10; i++) {
  const email = `faculty${i}@campushub.edu`;
  const empId = `EMP-CS-30${i}`;
  DEMO_USERS[email] = {
    password: `faculty${i}@123`,
    user: {
      id: `f_demo_${i}`,
      name: SOUTH_INDIAN_FACULTY[i - 1] || `Faculty ${i}`,
      email: email,
      role: "faculty",
      department: "Computer Science & Engineering",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      title: "Associate Professor",
      employeeId: empId,
      phone: `+91 98765 9990${i - 1}`,
      qualification: "Ph.D. in Software Architecture",
      experience: "12 Years",
      subjectsAssigned: "Data Structures, Database Systems",
      officeRoom: `Room 30${i}, LHC Block`,
      officeHours: "Mon-Fri 2:00 PM - 4:00 PM",
      address: `Room ${i}0, Faculty Quarters, CampusHub Uni`,
      bloodGroup: "A+",
      joiningDate: "July 15, 2020",
      status: "Active",
    },
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (token: string) => {
    try {
      const res = await api.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = res.data;
      const mappedUser: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as "student" | "admin" | "faculty",
        subRole: profile.subRole,
        department: profile.department,
        avatar: profile.avatar,
        rollNo: profile.rollNo,
        semester: profile.semester,
        title: profile.title || profile.studentYear,
      };
      setUser(mappedUser);
      localStorage.setItem("erp_user", JSON.stringify(mappedUser));
    } catch (err) {
      console.error("Failed to load profile via token", err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("erp_user");
    const savedToken = localStorage.getItem("erp_access_token");

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("erp_user");
      }
    }

    if (savedToken && !savedUser) {
      fetchProfile(savedToken);
    }

    setIsLoading(false);
  }, []);

  const login = async (
    email: string,
    password: string,
    role: "student" | "admin" | "faculty"
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Try to call the backend login API
      const res = await api.post("/api/auth/login", { email, password });
      
      const { token, refreshToken, role: returnedRole } = res.data;

      if (returnedRole.toLowerCase() !== role.toLowerCase()) {
        return { success: false, error: "Invalid role selected for this account" };
      }

      localStorage.setItem("erp_access_token", token);
      localStorage.setItem("erp_refresh_token", refreshToken);

      // 2. Fetch the profile details
      const profileRes = await api.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profile = profileRes.data;
      const mappedUser: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as "student" | "admin" | "faculty",
        subRole: profile.subRole,
        department: profile.department,
        avatar: profile.avatar,
        rollNo: profile.rollNo,
        semester: profile.semester,
        title: profile.title || profile.studentYear,
      };

      setUser(mappedUser);
      localStorage.setItem("erp_user", JSON.stringify(mappedUser));
      return { success: true };
    } catch (err: any) {
      console.warn("Backend login failed, attempting demo fallback", err);

      // Fallback to Demo Users check if backend is unreachable or returns error
      const demo = DEMO_USERS[email.toLowerCase()];
      if (demo && demo.user.role === role) {
        const isPasswordCorrect =
          password === demo.password ||
          password === demo.user.rollNo ||
          password === (demo.user as any).employeeId;
        if (isPasswordCorrect) {
          setUser(demo.user);
          localStorage.setItem("erp_user", JSON.stringify(demo.user));
          return { success: true };
        }
      }

      return {
        success: false,
        error: err.response?.data?.message || "Invalid email or password for selected role",
      };
    }
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem("erp_access_token");
    if (token) {
      await fetchProfile(token);
    }
  };

  const updateUser = (updatedFields: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return null;
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem("erp_user", JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const impersonate = (targetUser: User) => {
    setUser(targetUser);
    localStorage.setItem("erp_user", JSON.stringify(targetUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("erp_user");
    localStorage.removeItem("erp_access_token");
    localStorage.removeItem("erp_refresh_token");
  };

  return (
    <div className="contents">
      <AuthContext.Provider
        value={{
          user,
          isAuthenticated: !!user,
          login,
          logout,
          isLoading,
          refreshProfile,
          updateUser,
          impersonate,
        }}
      >
        {children}
      </AuthContext.Provider>
    </div>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
