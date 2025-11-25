import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { Teacher } from "@/types";
import { bookingsData, routineSlotsData, studentsData } from "@/data/mockData";

const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const teacher = currentUser as Teacher;

  if (teacher.accountStatus === "Pending") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {teacher.name}</p>
        </div>

        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <Clock className="w-5 h-5" />
              Account Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your teacher account is currently awaiting approval from an administrator.
              You will receive access to all features once your account is approved.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const teacherBookings = bookingsData.filter(b => b.teacherID === teacher.teacherID);
  const teacherSlots = routineSlotsData.filter(s => s.teacherID === teacher.teacherID);
  const availableSlots = teacherSlots.filter(s => s.isAvailable).length;

  const stats = [
    {
      title: "Total Bookings",
      value: teacherBookings.length,
      icon: Calendar,
      color: "text-primary",
    },
    {
      title: "Pending Requests",
      value: teacherBookings.filter(b => b.status === "Pending").length,
      icon: Clock,
      color: "text-warning",
    },
    {
      title: "Approved",
      value: teacherBookings.filter(b => b.status === "Approved").length,
      icon: CheckCircle,
      color: "text-success",
    },
    {
      title: "Available Slots",
      value: availableSlots,
      icon: Calendar,
      color: "text-secondary",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {teacher.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Booking Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {teacherBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No bookings yet</p>
          ) : (
            <div className="space-y-4">
              {teacherBookings.slice(0, 5).map((booking) => {
                const student = studentsData.find(s => s.userId === booking.studentID);
                return (
                  <div key={booking.bookingID} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{student?.name || "Unknown Student"}</p>
                      <p className="text-sm text-muted-foreground">{booking.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.date} at {booking.time}
                      </p>
                    </div>
                    <Badge
                      variant={
                        booking.status === "Approved"
                          ? "default"
                          : booking.status === "Pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
