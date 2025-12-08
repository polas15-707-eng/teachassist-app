import { supabase } from "@/integrations/supabase/client";
import { Course } from "@/types";

export const courseService = {
  async getAllCourses(): Promise<Course[]> {
    const { data, error } = await supabase.from("courses").select("*");
    if (error) return [];
    return data || [];
  },

  async addCourse(courseName: string, courseId: string) {
    const { error } = await supabase.from("courses").insert({
      course_id: courseId,
      course_name: courseName.trim(),
    });
    return { error };
  },

  async deleteCourse(courseId: string) {
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    return { error };
  },

  async getCourseCount(): Promise<number> {
    const { count, error } = await supabase
      .from("courses")
      .select("id", { count: "exact" });
    if (error) return 0;
    return count || 0;
  },
};
