import { supabase } from "@/integrations/supabase/client";
import { Booking } from "@/types";

export interface BookingWithDetails {
  id: string;
  description: string;
  booking_date: string;
  booking_time: string;
  status: string;
  student_id?: string;
  teacher_id?: string;
  course_id?: string;
  teacherName: string;
  teacherId: string;
  studentName: string;
  courseName: string;
}

export const bookingService = {
  async createBooking(params: {
    studentId: string;
    teacherId: string;
    courseId: string;
    description: string;
    bookingDate: string;
    bookingTime: string;
  }) {
    const { error } = await supabase.from("bookings").insert({
      student_id: params.studentId,
      teacher_id: params.teacherId,
      course_id: params.courseId,
      description: params.description.trim(),
      booking_date: params.bookingDate,
      booking_time: params.bookingTime,
      status: "Pending",
    });
    return { error };
  },

  async getStudentBookings(studentId: string): Promise<BookingWithDetails[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select("id, description, booking_date, booking_time, status, teacher_id, course_id")
      .eq("student_id", studentId)
      .order("booking_date", { ascending: false });

    if (error || !data) return [];

    const enrichedBookings = await Promise.all(
      data.map(async (booking) => {
        const [teacherRes, courseRes] = await Promise.all([
          supabase.from("teachers").select("user_id, teacher_id").eq("id", booking.teacher_id).single(),
          supabase.from("courses").select("course_name").eq("id", booking.course_id).single(),
        ]);

        let teacherName = "Unknown Teacher";
        if (teacherRes.data?.user_id) {
          const profileRes = await supabase
            .from("profiles")
            .select("name")
            .eq("id", teacherRes.data.user_id)
            .single();
          teacherName = profileRes.data?.name || teacherName;
        }

        return {
          id: booking.id,
          description: booking.description,
          booking_date: booking.booking_date,
          booking_time: booking.booking_time,
          status: booking.status,
          teacherName,
          teacherId: teacherRes.data?.teacher_id || "",
          studentName: "",
          courseName: courseRes.data?.course_name || "Unknown Course",
        };
      })
    );

    return enrichedBookings;
  },

  async getTeacherBookings(teacherId: string): Promise<BookingWithDetails[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select("id, booking_date, booking_time, description, status, student_id, course_id")
      .eq("teacher_id", teacherId);

    if (error || !data) return [];

    const enrichedBookings = await Promise.all(
      data.map(async (booking) => {
        const [profileRes, courseRes] = await Promise.all([
          supabase.from("profiles").select("name").eq("id", booking.student_id).single(),
          supabase.from("courses").select("course_name").eq("id", booking.course_id).single(),
        ]);

        return {
          id: booking.id,
          description: booking.description,
          booking_date: booking.booking_date,
          booking_time: booking.booking_time,
          status: booking.status,
          student_id: booking.student_id,
          teacherName: "",
          teacherId: "",
          studentName: profileRes.data?.name || "Unknown Student",
          courseName: courseRes.data?.course_name || "Unknown Course",
        };
      })
    );

    return enrichedBookings;
  },

  async updateBookingStatus(bookingId: string, status: "Approved" | "Rejected") {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", bookingId);
    return { error };
  },

  async getStudentEmail(studentId: string): Promise<string | null> {
    const { data } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", studentId)
      .single();
    return data?.email || null;
  },
};
