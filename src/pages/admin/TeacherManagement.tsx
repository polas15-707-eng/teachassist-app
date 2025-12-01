import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TeacherWithProfile {
  id: string;
  teacher_id: string;
  account_status: string;
  profiles: {
    name: string;
    email: string;
  };
}

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState<TeacherWithProfile[]>([]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from("teachers")
      .select("id, teacher_id, account_status, user_id");

    if (error) {
      console.error("Error fetching teachers:", error);
      return;
    }

    if (!data) return;

    // Fetch profiles separately
    const enrichedTeachers = await Promise.all(
      data.map(async (teacher) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name, email")
          .eq("id", teacher.user_id)
          .single();

        return {
          ...teacher,
          profiles: {
            name: profile?.name || "Unknown",
            email: profile?.email || "Unknown",
          },
        };
      })
    );

    setTeachers(enrichedTeachers);
  };

  const handleApprove = async (teacherId: string) => {
    const { error } = await supabase
      .from("teachers")
      .update({ account_status: "Active" })
      .eq("id", teacherId);

    if (error) {
      toast.error("Failed to approve teacher");
      console.error(error);
      return;
    }

    toast.success("Teacher approved successfully!");
    fetchTeachers();
  };

  const handleReject = (teacherId: string) => {
    toast.info("Teacher account rejected");
  };

  const pendingTeachers = teachers.filter(t => t.account_status === "Pending");
  const activeTeachers = teachers.filter(t => t.account_status === "Active");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Teacher Management</h1>
          <p className="text-muted-foreground">Approve or manage teacher accounts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pending Approvals</span>
              <Badge variant="secondary">{pendingTeachers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingTeachers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No pending approvals</p>
            ) : (
              <div className="space-y-4">
                {pendingTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{teacher.profiles.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.profiles.email}</p>
                      <p className="text-xs text-muted-foreground">Teacher ID: {teacher.teacher_id}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(teacher.id)}
                        className="bg-success hover:bg-success/90"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(teacher.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Teachers</span>
              <Badge>{activeTeachers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTeachers.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No active teachers</p>
            ) : (
              <div className="space-y-4">
                {activeTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{teacher.profiles.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.profiles.email}</p>
                      <p className="text-xs text-muted-foreground">Teacher ID: {teacher.teacher_id}</p>
                    </div>
                    <Badge className="bg-success">Active</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherManagement;
