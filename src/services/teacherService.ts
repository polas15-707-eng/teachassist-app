import { supabase } from "@/integrations/supabase/client";
import { RoutineSlot } from "@/types";

export interface TeacherWithProfile {
  id: string;
  teacher_id: string;
  account_status: string;
  user_id: string;
  name: string;
  email: string;
}

export const teacherService = {
  async getAllTeachers(): Promise<TeacherWithProfile[]> {
    const { data, error } = await supabase
      .from("teachers")
      .select("id, teacher_id, account_status, user_id");

    if (error || !data) return [];

    const enrichedTeachers = await Promise.all(
      data.map(async (teacher) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, email")
          .eq("id", teacher.user_id)
          .single();

        return {
          ...teacher,
          name: profile?.name || "Unknown",
          email: profile?.email || "Unknown",
        };
      })
    );

    return enrichedTeachers;
  },

  async getActiveTeachers(): Promise<TeacherWithProfile[]> {
    const teachers = await this.getAllTeachers();
    return teachers.filter((t) => t.account_status === "Active");
  },

  async updateTeacherStatus(teacherId: string, status: "Active" | "Pending") {
    const { error } = await supabase
      .from("teachers")
      .update({ account_status: status })
      .eq("id", teacherId);
    return { error };
  },

  async getTeacherSlots(teacherId: string): Promise<RoutineSlot[]> {
    const { data, error } = await supabase
      .from("routine_slots")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("day");

    if (error) return [];
    return data || [];
  },

  async getAvailableSlots(teacherId: string): Promise<RoutineSlot[]> {
    const { data, error } = await supabase
      .from("routine_slots")
      .select("*")
      .eq("teacher_id", teacherId)
      .eq("is_available", true);

    if (error) return [];
    return data || [];
  },

  async addSlot(params: {
    teacherId: string;
    day: string;
    startTime: string;
    endTime: string;
  }) {
    const { error } = await supabase.from("routine_slots").insert({
      teacher_id: params.teacherId,
      day: params.day,
      start_time: params.startTime,
      end_time: params.endTime,
      is_available: true,
    });
    return { error };
  },

  async deleteSlot(slotId: string) {
    const { error } = await supabase.from("routine_slots").delete().eq("id", slotId);
    return { error };
  },
};
