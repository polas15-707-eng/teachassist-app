import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { teacherService } from "@/services/teacherService";
import { emailService } from "@/services/emailService";
import { useTeachers } from "@/hooks/useTeachers";
import { toast } from "sonner";

const TeacherManagement = () => {
  const { pendingTeachers, activeTeachers, loading, refetch } = useTeachers();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (teacherId: string) => {
    const teacher = pendingTeachers.find((t) => t.id === teacherId);
    if (!teacher) return;

    setProcessingId(teacherId);
    const { error } = await teacherService.updateTeacherStatus(teacherId, "Active");

    if (error) {
      toast.error("Failed to approve teacher");
      setProcessingId(null);
      return;
    }

    // Send approval email
    await emailService.sendTeacherApprovalEmail(teacher.email, teacher.name);

    toast.success("Teacher approved successfully!");
    setProcessingId(null);
    refetch();
  };

  const handleReject = (teacherId: string) => {
    toast.info("Teacher account rejected");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

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
                  <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      <p className="text-xs text-muted-foreground">Teacher ID: {teacher.teacher_id}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(teacher.id)}
                        className="bg-success hover:bg-success/90"
                        disabled={processingId === teacher.id}
                      >
                        {processingId === teacher.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(teacher.id)}
                        disabled={processingId === teacher.id}
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
                  <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      <p className="text-xs text-muted-foreground">Teacher ID: {teacher.teacher_id}</p>
                    </div>
                    <Badge className="bg-success text-success-foreground">Active</Badge>
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
