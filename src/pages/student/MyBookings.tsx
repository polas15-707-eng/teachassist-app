import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BookingWithDetails {
  id: string;
  description: string;
  booking_date: string;
  booking_time: string;
  status: string;
  teachers: {
    teacher_id: string;
    profiles: { name: string };
  };
  courses: {
    course_name: string;
  };
}

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          description,
          booking_date,
          booking_time,
          status,
          teachers (
            teacher_id,
            profiles (name)
          ),
          courses (course_name)
        `)
        .eq("student_id", user.id)
        .order("booking_date", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        return;
      }

      setBookings(data || []);
      setLoading(false);
    };

    fetchBookings();
  }, [user]);

  const upcomingBookings = bookings.filter(
    b => b.status === "Approved" && new Date(b.booking_date) >= new Date()
  );
  const pendingBookings = bookings.filter(b => b.status === "Pending");
  const pastBookings = bookings.filter(
    b => b.status === "Approved" && new Date(b.booking_date) < new Date()
  );

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
          <p className="text-muted-foreground">View and track your counselling sessions</p>
        </div>

        {upcomingBookings.length > 0 && (
          <Alert className="border-success bg-success/5">
            <Bell className="h-4 w-4 text-success" />
            <AlertTitle className="text-success">Upcoming Sessions</AlertTitle>
            <AlertDescription className="text-muted-foreground">
              You have {upcomingBookings.length} upcoming session(s). 
              You will receive a reminder 90 minutes before each session.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upcoming Sessions</span>
              <Badge>{upcomingBookings.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No upcoming sessions</p>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="p-4 border rounded-lg bg-success/5 border-success">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div>
                          <p className="font-semibold text-lg">{booking.teachers?.profiles?.name || "Unknown Teacher"}</p>
                          <p className="text-sm text-muted-foreground">{booking.courses?.course_name}</p>
                        </div>
                        <p className="text-sm">{booking.description}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">{booking.booking_date} at {booking.booking_time}</span>
                        </div>
                      </div>
                      <Badge className="bg-success">Approved</Badge>
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
              <span>Pending Requests</span>
              <Badge variant="secondary">{pendingBookings.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No pending requests</p>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <div key={booking.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{booking.teachers?.profiles?.name || "Unknown Teacher"}</p>
                        <p className="text-sm text-muted-foreground">{booking.courses?.course_name}</p>
                        <p className="text-sm">{booking.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.booking_date} at {booking.booking_time}
                        </p>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {pastBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No past sessions</p>
            ) : (
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <div key={booking.id} className="p-4 border rounded-lg opacity-75">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{booking.teachers?.profiles?.name || "Unknown Teacher"}</p>
                        <p className="text-sm text-muted-foreground">{booking.courses?.course_name}</p>
                        <p className="text-sm">{booking.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.booking_date} at {booking.booking_time}
                        </p>
                      </div>
                      <Badge>Completed</Badge>
                    </div>
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

export default MyBookings;
