import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingWithDetails {
  id: string;
  booking_date: string;
  booking_time: string;
  description: string;
  status: string;
  profiles: { name: string };
  courses: { course_name: string };
}

const BookingManagement = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);

  useEffect(() => {
    fetchBookings();
  }, [currentUser]);

  const fetchBookings = async () => {
    if (!currentUser?.teacher?.id) return;

    const { data, error } = await supabase
      .from("bookings")
      .select("id, booking_date, booking_time, description, status, student_id, course_id")
      .eq("teacher_id", currentUser.teacher.id);

    if (error) {
      console.error("Error fetching bookings:", error);
      return;
    }

    if (!data) return;

    // Fetch student profiles and courses separately
    const enrichedBookings = await Promise.all(
      data.map(async (booking) => {
        const [profileRes, courseRes] = await Promise.all([
          supabase.from("profiles").select("name").eq("id", booking.student_id).single(),
          supabase.from("courses").select("course_name").eq("id", booking.course_id).single(),
        ]);

        return {
          ...booking,
          profiles: { name: profileRes.data?.name || "Unknown Student" },
          courses: { course_name: courseRes.data?.course_name || "Unknown Course" },
        };
      })
    );

    setBookings(enrichedBookings);
  };

  const handleApprove = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "Approved" })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to approve booking");
      console.error(error);
      return;
    }

    toast.success("Booking approved successfully!");
    fetchBookings();
  };

  const handleReject = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "Rejected" })
      .eq("id", bookingId);

    if (error) {
      toast.error("Failed to reject booking");
      console.error(error);
      return;
    }

    toast.info("Booking rejected");
    fetchBookings();
  };

  const pendingBookings = bookings.filter(b => b.status === "Pending");
  const processedBookings = bookings.filter(b => b.status !== "Pending");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Booking Management</h1>
          <p className="text-muted-foreground">Review and manage counselling requests</p>
        </div>

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
                  <div
                    key={booking.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{booking.profiles.name}</p>
                        <p className="text-sm text-muted-foreground">{booking.courses.course_name}</p>
                        <p className="text-sm">{booking.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.booking_date} at {booking.booking_time}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(booking.id)}
                        className="bg-success hover:bg-success/90"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(booking.id)}
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
            <CardTitle>Booking History</CardTitle>
          </CardHeader>
          <CardContent>
            {processedBookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No booking history</p>
            ) : (
              <div className="space-y-4">
                {processedBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{booking.profiles.name}</p>
                      <p className="text-sm text-muted-foreground">{booking.courses.course_name}</p>
                      <p className="text-sm">{booking.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.booking_date} at {booking.booking_time}
                      </p>
                    </div>
                    <Badge
                      variant={booking.status === "Approved" ? "default" : "destructive"}
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
    </DashboardLayout>
  );
};

export default BookingManagement;
