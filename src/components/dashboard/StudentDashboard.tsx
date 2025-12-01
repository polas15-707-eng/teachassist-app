import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar, CheckCircle, Clock, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BookingWithDetails {
  id: string;
  booking_date: string;
  booking_time: string;
  description: string;
  status: string;
  teachers: {
    teacher_id: string;
    profiles: { name: string };
  };
  courses: {
    course_name: string;
  };
}

const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser?.profile.id) return;

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_date,
          booking_time,
          description,
          status,
          teacher_id,
          course_id
        `)
        .eq("student_id", currentUser.profile.id);

      if (error || !data) {
        console.error("Error fetching bookings:", error);
        return;
      }

      // Fetch teacher and course details separately
      const enrichedBookings = await Promise.all(
        data.map(async (booking) => {
          const [teacherRes, courseRes] = await Promise.all([
            supabase.from("teachers").select("user_id, teacher_id").eq("id", booking.teacher_id).single(),
            supabase.from("courses").select("course_name").eq("id", booking.course_id).single(),
          ]);

          let teacherName = "Unknown Teacher";
          if (teacherRes.data?.user_id) {
            const profileRes = await supabase
              .from("profiles")
              .select("name")
              .eq("id", teacherRes.data.user_id)
              .single();
            teacherName = profileRes.data?.name || teacherName;
          }

          return {
            ...booking,
            teachers: {
              teacher_id: teacherRes.data?.teacher_id || "",
              profiles: { name: teacherName },
            },
            courses: {
              course_name: courseRes.data?.course_name || "Unknown Course",
            },
          };
        })
      );

      setBookings(enrichedBookings);
    };

    fetchBookings();
  }, [currentUser]);

  const upcomingBookings = bookings.filter(
    b => b.status === "Approved" && new Date(b.booking_date) >= new Date()
  );

  const stats = [
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: Calendar,
      color: "text-primary",
    },
    {
      title: "Pending",
      value: bookings.filter(b => b.status === "Pending").length,
      icon: Clock,
      color: "text-warning",
    },
    {
      title: "Approved",
      value: bookings.filter(b => b.status === "Approved").length,
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
        <p className="text-muted-foreground">Welcome back, {currentUser?.profile.name}</p>
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
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No bookings yet. Book your first session!
            </p>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{booking.teachers.profiles.name}</p>
                    <p className="text-sm text-muted-foreground">{booking.courses.course_name}</p>
                    <p className="text-sm text-muted-foreground">{booking.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {booking.booking_date} at {booking.booking_time}
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
