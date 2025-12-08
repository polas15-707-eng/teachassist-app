import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { bookingService } from "@/services/bookingService";
import { emailService } from "@/services/emailService";
import { useTeacherBookings } from "@/hooks/useBookings";
import { toast } from "sonner";

const BookingManagement = () => {
  const { currentUser } = useAuth();
  const { pendingBookings, processedBookings, loading, refetch } = useTeacherBookings(currentUser?.teacher?.id);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (bookingId: string) => {
    const booking = pendingBookings.find((b) => b.id === bookingId);
    if (!booking) return;

    setProcessingId(bookingId);
    const { error } = await bookingService.updateBookingStatus(bookingId, "Approved");

    if (error) {
      toast.error("Failed to approve booking");
      setProcessingId(null);
      return;
    }

    // Send approval email
    if (booking.student_id) {
      const studentEmail = await bookingService.getStudentEmail(booking.student_id);
      if (studentEmail) {
        await emailService.sendBookingApprovedEmail({
          studentEmail,
          studentName: booking.studentName,
          teacherName: currentUser?.profile.name || "Your Teacher",
          courseName: booking.courseName,
          bookingDate: booking.booking_date,
          bookingTime: booking.booking_time,
        });
      }
    }

    toast.success("Booking approved successfully!");
    setProcessingId(null);
    refetch();
  };

  const handleReject = async (bookingId: string) => {
    setProcessingId(bookingId);
    const { error } = await bookingService.updateBookingStatus(bookingId, "Rejected");

    if (error) {
      toast.error("Failed to reject booking");
      setProcessingId(null);
      return;
    }

    toast.info("Booking rejected");
    setProcessingId(null);
    refetch();
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
                  <div key={booking.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{booking.studentName}</p>
                        <p className="text-sm text-muted-foreground">{booking.courseName}</p>
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
                        disabled={processingId === booking.id}
                      >
                        {processingId === booking.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(booking.id)}
                        disabled={processingId === booking.id}
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
                  <div key={booking.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{booking.studentName}</p>
                      <p className="text-sm text-muted-foreground">{booking.courseName}</p>
                      <p className="text-sm">{booking.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.booking_date} at {booking.booking_time}
                      </p>
                    </div>
                    <Badge variant={booking.status === "Approved" ? "default" : "destructive"}>
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
