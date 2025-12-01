import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BookingWithDetails {
  id: string;
  booking_date: string;
  booking_time: string;
  description: string;
  status: string;
  profiles: { name: string };
}

const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [slots, setSlots] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.teacher?.id) return;

      const [bookingsRes, slotsRes] = await Promise.all([
        supabase
          .from("bookings")
          .select("id, booking_date, booking_time, description, status, student_id")
          .eq("teacher_id", currentUser.teacher.id),
        supabase
          .from("routine_slots")
          .select("id", { count: "exact" })
          .eq("teacher_id", currentUser.teacher.id)
          .eq("is_available", true),
      ]);

      if (bookingsRes.data) {
        // Fetch student profiles separately
        const enrichedBookings = await Promise.all(
          bookingsRes.data.map(async (booking) => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", booking.student_id)
              .single();

            return {
              ...booking,
              profiles: { name: profile?.name || "Unknown Student" },
            };
          })
        );
        setBookings(enrichedBookings);
      }
      setSlots(slotsRes.count || 0);
    };

    fetchData();
  }, [currentUser]);

  if (currentUser?.teacher?.account_status === "Pending") {
    return (
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {currentUser?.profile.name}</p>
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

  const stats = [
    {
      title: "Total Bookings",
      value: bookings.length,
      icon: Calendar,
      color: "text-primary",
    },
    {
      title: "Pending Requests",
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
      title: "Available Slots",
      value: slots,
      icon: Calendar,
      color: "text-secondary",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Teacher Dashboard</h1>
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Booking Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No bookings yet</p>
          ) : (
            <div className="space-y-4">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{booking.profiles.name}</p>
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

export default TeacherDashboard;
