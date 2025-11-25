import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, CheckCircle, Clock, Bell } from "lucide-react";
import { bookingsData, teachersData, coursesData } from "@/data/mockData";

const StudentDashboard = () => {
  const { currentUser } = useAuth();

  const studentBookings = bookingsData.filter(b => b.studentID === currentUser?.userId);
  const upcomingBookings = studentBookings.filter(
    b => b.status === "Approved" && new Date(b.date) >= new Date()
  );

  const stats = [
    {
      title: "Total Bookings",
      value: studentBookings.length,
      icon: Calendar,
      color: "text-primary",
    },
    {
      title: "Pending",
      value: studentBookings.filter(b => b.status === "Pending").length,
      icon: Clock,
      color: "text-warning",
    },
    {
      title: "Approved",
      value: studentBookings.filter(b => b.status === "Approved").length,
      icon: CheckCircle,
      color: "text-success",
    },
    {
      title: "Upcoming",
      value: upcomingBookings.length,
      icon: Bell,
      color: "text-secondary",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {currentUser?.name}</p>
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

      {upcomingBookings.length > 0 && (
        <Alert className="border-success bg-success/5">
          <Bell className="h-4 w-4 text-success" />
          <AlertTitle className="text-success">Upcoming Sessions</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            You have {upcomingBookings.length} upcoming counselling session(s). 
            You will receive a reminder 90 minutes before each session.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {studentBookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No bookings yet. Book your first session!
            </p>
          ) : (
            <div className="space-y-4">
              {studentBookings.map((booking) => {
                const teacher = teachersData.find(t => t.teacherID === booking.teacherID);
                const course = coursesData.find(c => c.courseID === booking.courseID);
                return (
                  <div key={booking.bookingID} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{teacher?.name || "Unknown Teacher"}</p>
                      <p className="text-sm text-muted-foreground">{course?.courseName}</p>
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

export default StudentDashboard;
