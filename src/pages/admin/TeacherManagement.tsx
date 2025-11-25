import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { teachersData } from "@/data/mockData";
import { Teacher } from "@/types";
import { toast } from "sonner";

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(teachersData);

  const handleApprove = (teacherId: string) => {
    setTeachers(prev =>
      prev.map(t =>
        t.teacherID === teacherId ? { ...t, accountStatus: "Active" } : t
      )
    );
    toast.success("Teacher approved successfully!");
  };

  const handleReject = (teacherId: string) => {
    toast.info("Teacher account rejected");
  };

  const pendingTeachers = teachers.filter(t => t.accountStatus === "Pending");
  const activeTeachers = teachers.filter(t => t.accountStatus === "Active");

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
                    key={teacher.teacherID}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      <p className="text-xs text-muted-foreground">Teacher ID: {teacher.teacherID}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(teacher.teacherID)}
                        className="bg-success hover:bg-success/90"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(teacher.teacherID)}
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
                    key={teacher.teacherID}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      <p className="text-xs text-muted-foreground">Teacher ID: {teacher.teacherID}</p>
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
