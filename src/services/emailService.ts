import { supabase } from "@/integrations/supabase/client";

export const emailService = {
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
};
