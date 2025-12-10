import { supabase } from "@/integrations/supabase/client";

export const emailService = {
  // Teacher Registration - Notify Admin
  async sendTeacherRegistrationNotification(params: {
    teacherName: string;
    teacherEmail: string;
    adminEmail: string;
  }) {
    try {
      const { error } = await supabase.functions.invoke("send-teacher-registration-notification", {
        body: params,
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Failed to send teacher registration notification:", error);
      return { success: false, error };
    }
  },

  // Teacher Approved - Notify Teacher
  async sendTeacherApprovalEmail(teacherEmail: string, teacherName: string) {
    try {
      const { error } = await supabase.functions.invoke("send-teacher-approval-email", {
        body: { teacherEmail, teacherName },
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Failed to send teacher approval email:", error);
      return { success: false, error };
    }
  },

  // Teacher Rejected - Notify Teacher
  async sendTeacherRejectionEmail(teacherEmail: string, teacherName: string) {
    try {
      const { error } = await supabase.functions.invoke("send-teacher-rejection-email", {
        body: { teacherEmail, teacherName },
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Failed to send teacher rejection email:", error);
      return { success: false, error };
    }
  },

  // New Booking - Notify Teacher
  async sendNewBookingNotification(params: {
    teacherEmail: string;
    teacherName: string;
    studentName: string;
    courseName: string;
    bookingDate: string;
    bookingTime: string;
    description: string;
  }) {
    try {
      const { error } = await supabase.functions.invoke("send-new-booking-notification", {
        body: params,
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Failed to send new booking notification:", error);
      return { success: false, error };
    }
  },

  // Booking Approved - Notify Student
  async sendBookingApprovedEmail(params: {
    studentEmail: string;
    studentName: string;
    teacherName: string;
    courseName: string;
    bookingDate: string;
    bookingTime: string;
  }) {
    try {
      const { error } = await supabase.functions.invoke("send-booking-approved-email", {
        body: params,
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Failed to send booking approved email:", error);
      return { success: false, error };
    }
  },

  // Booking Rejected - Notify Student
  async sendBookingRejectedEmail(params: {
    studentEmail: string;
    studentName: string;
    teacherName: string;
    courseName: string;
    bookingDate: string;
    bookingTime: string;
  }) {
    try {
      const { error } = await supabase.functions.invoke("send-booking-rejected-email", {
        body: params,
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error("Failed to send booking rejected email:", error);
      return { success: false, error };
    }
  },
};
