import { useState, useEffect, useCallback } from "react";
import { bookingService, BookingWithDetails } from "@/services/bookingService";

export function useStudentBookings(studentId: string | undefined) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    const data = await bookingService.getStudentBookings(studentId);
    setBookings(data);
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const upcomingBookings = bookings.filter(
    (b) => b.status === "Approved" && new Date(b.booking_date) >= new Date()
  );
  const pendingBookings = bookings.filter((b) => b.status === "Pending");
  const pastBookings = bookings.filter(
    (b) => b.status === "Approved" && new Date(b.booking_date) < new Date()
  );

  return {
    bookings,
    upcomingBookings,
    pendingBookings,
    pastBookings,
    loading,
    refetch: fetchBookings,
  };
}

export function useTeacherBookings(teacherId: string | undefined) {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    const data = await bookingService.getTeacherBookings(teacherId);
    setBookings(data);
    setLoading(false);
  }, [teacherId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const pendingBookings = bookings.filter((b) => b.status === "Pending");
  const processedBookings = bookings.filter((b) => b.status !== "Pending");

  return {
    bookings,
    pendingBookings,
    processedBookings,
    loading,
    refetch: fetchBookings,
  };
}
