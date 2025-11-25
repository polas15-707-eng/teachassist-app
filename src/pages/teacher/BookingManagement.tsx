import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { bookingsData, studentsData, coursesData } from "@/data/mockData";
import { Booking, Teacher } from "@/types";
import { toast } from "sonner";

const BookingManagement = () => {
  const { currentUser } = useAuth();
  const teacher = currentUser as Teacher;
  const [bookings, setBookings] = useState<Booking[]>(
    bookingsData.filter(b => b.teacherID === teacher.teacherID)
  );

  const handleApprove = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b =>
        b.bookingID === bookingId ? { ...b, status: "Approved" } : b
      )
    );
    const booking = bookingsData.find(b => b.bookingID === bookingId);
    if (booking) {
      booking.status = "Approved";
    }
    toast.success("Booking approved successfully!");
  };

  const handleReject = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b =>
        b.bookingID === bookingId ? { ...b, status: "Rejected" } : b
      )
    );
    const booking = bookingsData.find(b => b.bookingID === bookingId);
    if (booking) {
      booking.status = "Rejected";
    }
    toast.info("Booking rejected");
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
                {pendingBookings.map((booking) => {
                  const student = studentsData.find(s => s.userId === booking.studentID);
                  const course = coursesData.find(c => c.courseID === booking.courseID);
                  return (
                    <div
                      key={booking.bookingID}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{student?.name || "Unknown Student"}</p>
                          <p className="text-sm text-muted-foreground">{course?.courseName}</p>
                          <p className="text-sm">{booking.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {booking.date} at {booking.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(booking.bookingID)}
                          className="bg-success hover:bg-success/90"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(booking.bookingID)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
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
                {processedBookings.map((booking) => {
                  const student = studentsData.find(s => s.userId === booking.studentID);
                  const course = coursesData.find(c => c.courseID === booking.courseID);
                  return (
                    <div
                      key={booking.bookingID}
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{student?.name || "Unknown Student"}</p>
                        <p className="text-sm text-muted-foreground">{course?.courseName}</p>
                        <p className="text-sm">{booking.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.date} at {booking.time}
                        </p>
                      </div>
                      <Badge
                        variant={booking.status === "Approved" ? "default" : "destructive"}
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
    </DashboardLayout>
  );
};

export default BookingManagement;
