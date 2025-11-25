import { User, Teacher, Course, RoutineSlot, Booking } from "@/types";

// Admin user
export const adminUser: User = {
  userId: "admin-001",
  name: "John Admin",
  email: "admin@portal.com",
  password: "admin123",
  role: "admin",
};

// Teachers
export const teachersData: Teacher[] = [
  {
    userId: "user-t001",
    teacherID: "T001",
    name: "Dr. Sarah Johnson",
    email: "sarah.j@portal.com",
    password: "teacher123",
    role: "teacher",
    accountStatus: "Active",
  },
  {
    userId: "user-t002",
    teacherID: "T002",
    name: "Prof. Michael Chen",
    email: "michael.c@portal.com",
    password: "teacher123",
    role: "teacher",
    accountStatus: "Active",
  },
  {
    userId: "user-t003",
    teacherID: "T003",
    name: "Dr. Emily Davis",
    email: "emily.d@portal.com",
    password: "teacher123",
    role: "teacher",
    accountStatus: "Pending",
  },
  {
    userId: "user-t004",
    teacherID: "T004",
    name: "Prof. Robert Wilson",
    email: "robert.w@portal.com",
    password: "teacher123",
    role: "teacher",
    accountStatus: "Pending",
  },
];

// Students
export const studentsData: User[] = [
  {
    userId: "user-s001",
    name: "Alice Cooper",
    email: "alice.c@student.com",
    password: "student123",
    role: "student",
  },
  {
    userId: "user-s002",
    name: "Bob Martinez",
    email: "bob.m@student.com",
    password: "student123",
    role: "student",
  },
  {
    userId: "user-s003",
    name: "Carol White",
    email: "carol.w@student.com",
    password: "student123",
    role: "student",
  },
];

// Courses
export const coursesData: Course[] = [
  { courseID: "C001", courseName: "Database Systems" },
  { courseID: "C002", courseName: "Web Development" },
  { courseID: "C003", courseName: "Data Structures" },
  { courseID: "C004", courseName: "Machine Learning" },
  { courseID: "C005", courseName: "Software Engineering" },
];

// Routine Slots
export const routineSlotsData: RoutineSlot[] = [
  {
    slotID: "slot-001",
    teacherID: "T001",
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
    isAvailable: true,
  },
  {
    slotID: "slot-002",
    teacherID: "T001",
    day: "Monday",
    startTime: "14:00",
    endTime: "15:00",
    isAvailable: true,
  },
  {
    slotID: "slot-003",
    teacherID: "T001",
    day: "Wednesday",
    startTime: "10:00",
    endTime: "11:00",
    isAvailable: false,
  },
  {
    slotID: "slot-004",
    teacherID: "T002",
    day: "Tuesday",
    startTime: "11:00",
    endTime: "12:00",
    isAvailable: true,
  },
  {
    slotID: "slot-005",
    teacherID: "T002",
    day: "Thursday",
    startTime: "13:00",
    endTime: "14:00",
    isAvailable: true,
  },
  {
    slotID: "slot-006",
    teacherID: "T002",
    day: "Friday",
    startTime: "15:00",
    endTime: "16:00",
    isAvailable: true,
  },
];

// Bookings
export const bookingsData: Booking[] = [
  {
    bookingID: "B001",
    studentID: "user-s001",
    teacherID: "T001",
    courseID: "C001",
    description: "Need help with SQL queries and database normalization",
    date: "2025-12-01",
    time: "09:00",
    status: "Approved",
  },
  {
    bookingID: "B002",
    studentID: "user-s002",
    teacherID: "T002",
    courseID: "C002",
    description: "Questions about React hooks and state management",
    date: "2025-12-02",
    time: "11:00",
    status: "Pending",
  },
  {
    bookingID: "B003",
    studentID: "user-s003",
    teacherID: "T001",
    courseID: "C003",
    description: "Binary trees and graph traversal algorithms",
    date: "2025-12-03",
    time: "14:00",
    status: "Pending",
  },
  {
    bookingID: "B004",
    studentID: "user-s001",
    teacherID: "T002",
    courseID: "C004",
    description: "Neural networks and deep learning concepts",
    date: "2025-12-04",
    time: "13:00",
    status: "Rejected",
  },
];
