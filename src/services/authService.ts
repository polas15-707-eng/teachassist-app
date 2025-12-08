import { supabase } from "@/integrations/supabase/client";
import { UserWithRole } from "@/types";

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signUp(
    name: string,
    email: string,
    password: string,
    role: "teacher" | "student"
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  async fetchUserData(userId: string): Promise<UserWithRole | null> {
    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      // Fetch role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (roleError) throw roleError;

      // If teacher, fetch teacher data
      let teacher = undefined;
      if (roleData.role === "teacher") {
        const { data: teacherData } = await supabase
          .from("teachers")
          .select("*")
          .eq("user_id", userId)
          .single();

        teacher = teacherData || undefined;
      }

      return {
        profile,
        role: roleData.role,
        teacher,
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  },
};
