export type UserRole = "admin" | "teacher" | "student";

export type AccountStatus = "Pending" | "Active";

export type BookingStatus = "Pending" | "Approved" | "Rejected";

export interface User {
  userId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface Teacher extends User {
  teacherID: string;
  accountStatus: AccountStatus;
}

export interface Course {
  courseID: string;
  courseName: string;
}

export interface RoutineSlot {
  slotID: string;
  teacherID: string;
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Booking {
  bookingID: string;
  studentID: string;
  teacherID: string;
  courseID: string;
  description: string;
  date: string;
  time: string;
  status: BookingStatus;
}
