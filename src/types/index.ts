export type AccountStatus = "Pending" | "Active";

export type BookingStatus = "Pending" | "Approved" | "Rejected";

export interface Profile {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface UserRoleData {
  id: string;
  user_id: string;
  role: "admin" | "teacher" | "student";
  created_at: string;
}

export interface Teacher {
  id: string;
  user_id: string;
  teacher_id: string;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  course_id: string;
  course_name: string;
  created_at: string;
}

export interface RoutineSlot {
  id: string;
  teacher_id: string;
  day: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  student_id: string;
  teacher_id: string;
  course_id: string;
  description: string;
  booking_date: string;
  booking_time: string;
  status: BookingStatus;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole {
  profile: Profile;
  role: "admin" | "teacher" | "student";
  teacher?: Teacher;
}
