import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User, AlertCircle } from "lucide-react";
import { bookingService } from "@/services/bookingService";
import { useCourses } from "@/hooks/useCourses";
import { useActiveTeachers, useAvailableSlots } from "@/hooks/useTeachers";
import { bookingSchema } from "@/lib/validation";
import { toast } from "sonner";

const BookSession = () => {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { teachers } = useActiveTeachers();
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { slots } = useAvailableSlots(selectedTeacher);

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = bookingSchema.safeParse({
      courseId: selectedCourse,
      teacherId: selectedTeacher,
      slotId: selectedSlot,
      date: selectedDate,
      description,
    });

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        newErrors[err.path[0] as string] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    if (!user) return;

    const slot = slots.find((s) => s.id === selectedSlot);
    if (!slot) {
      toast.error("Please select a valid time slot");
      return;
    }

    setIsSubmitting(true);
    const { error } = await bookingService.createBooking({
      studentId: user.id,
      teacherId: selectedTeacher,
      courseId: selectedCourse,
      description: description.trim(),
      bookingDate: selectedDate,
      bookingTime: slot.start_time,
    });

    if (error) {
      toast.error("Failed to submit booking: " + error.message);
      setIsSubmitting(false);
      return;
    }

    toast.success("Booking submitted successfully! Waiting for teacher approval.");
    
    // Reset form
    setSelectedCourse("");
    setSelectedTeacher("");
    setSelectedSlot("");
    setSelectedDate("");
    setDescription("");
    setIsSubmitting(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Book Counselling Session</h1>
          <p className="text-muted-foreground">Schedule a session with a teacher</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBookSession} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger id="course" className={errors.courseId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.course_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.courseId && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.courseId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher">Teacher</Label>
                  <Select value={selectedTeacher} onValueChange={(v) => { setSelectedTeacher(v); setSelectedSlot(""); }}>
                    <SelectTrigger id="teacher" className={errors.teacherId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.teacherId && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.teacherId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slot">Available Time Slot</Label>
                  <Select value={selectedSlot} onValueChange={setSelectedSlot} disabled={!selectedTeacher}>
                    <SelectTrigger id="slot" className={errors.slotId ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {slots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {slot.day} - {slot.start_time} to {slot.end_time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.slotId && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.slotId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Preferred Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={errors.date ? "border-destructive" : ""}
                  />
                  {errors.date && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.date}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">What do you need help with?</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your questions or topics you'd like to discuss..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    maxLength={500}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  <div className="flex justify-between">
                    {errors.description ? (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.description}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-muted-foreground">{description.length}/500</span>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Booking Request"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Available Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {courses.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No courses available</p>
                  ) : (
                    courses.map((course) => (
                      <div key={course.id} className="p-3 border rounded-lg">
                        <p className="font-medium">{course.course_name}</p>
                        <p className="text-xs text-muted-foreground">{course.course_id}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Active Teachers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {teachers.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No active teachers</p>
                  ) : (
                    teachers.map((teacher) => (
                      <div key={teacher.id} className="p-3 border rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium">{teacher.name}</p>
                          <p className="text-xs text-muted-foreground">{teacher.teacher_id}</p>
                        </div>
                        <Badge className="bg-success text-success-foreground">Active</Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookSession;
