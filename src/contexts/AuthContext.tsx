import React, { createContext, useContext, useState, ReactNode } from "react";
import { User, Teacher } from "@/types";
import { adminUser, teachersData, studentsData } from "@/data/mockData";

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string, role: "teacher" | "student") => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    // Check admin
    if (email === adminUser.email && password === adminUser.password) {
      setCurrentUser(adminUser);
      return true;
    }

    // Check teachers
    const teacher = teachersData.find(
      (t) => t.email === email && t.password === password
    );
    if (teacher) {
      setCurrentUser(teacher);
      return true;
    }

    // Check students
    const student = studentsData.find(
      (s) => s.email === email && s.password === password
    );
    if (student) {
      setCurrentUser(student);
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (name: string, email: string, password: string, role: "teacher" | "student"): boolean => {
    // Check if email already exists
    const allUsers = [adminUser, ...teachersData, ...studentsData];
    if (allUsers.some(user => user.email === email)) {
      return false;
    }

    const newUserId = `user-${role.charAt(0)}${Date.now()}`;
    
    if (role === "teacher") {
      const newTeacherId = `T${String(teachersData.length + 1).padStart(3, '0')}`;
      const newTeacher: Teacher = {
        userId: newUserId,
        teacherID: newTeacherId,
        name,
        email,
        password,
        role: "teacher",
        accountStatus: "Pending",
      };
      teachersData.push(newTeacher);
      setCurrentUser(newTeacher);
    } else {
      const newStudent: User = {
        userId: newUserId,
        name,
        email,
        password,
        role: "student",
      };
      studentsData.push(newStudent);
      setCurrentUser(newStudent);
    }

    return true;
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};
