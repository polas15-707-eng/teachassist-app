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
import { BookOpen, User, Calendar } from "lucide-react";
import { coursesData, teachersData, routineSlotsData, bookingsData } from "@/data/mockData";
import { Booking } from "@/types";
import { toast } from "sonner";

const BookSession = () => {
  const { currentUser } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [description, setDescription] = useState("");

  const activeTeachers = teachersData.filter(t => t.accountStatus === "Active");
  const availableSlots = selectedTeacher
    ? routineSlotsData.filter(s => s.teacherID === selectedTeacher && s.isAvailable)
    : [];

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse || !selectedTeacher || !selectedSlot || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const slot = routineSlotsData.find(s => s.slotID === selectedSlot);
    if (!slot) return;

    const newBooking: Booking = {
      bookingID: `B${String(bookingsData.length + 1).padStart(3, '0')}`,
      studentID: currentUser?.userId || "",
      teacherID: selectedTeacher,
      courseID: selectedCourse,
      description: description.trim(),
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Next week
      time: slot.startTime,
      status: "Pending",
    };

    bookingsData.push(newBooking);
    toast.success("Booking submitted successfully! Waiting for teacher approval.");
    
    // Reset form
    setSelectedCourse("");
    setSelectedTeacher("");
    setSelectedSlot("");
    setDescription("");
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
                    <SelectTrigger id="course">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {coursesData.map((course) => (
                        <SelectItem key={course.courseID} value={course.courseID}>
                          {course.courseName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher">Teacher</Label>
                  <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger id="teacher">
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeTeachers.map((teacher) => (
                        <SelectItem key={teacher.teacherID} value={teacher.teacherID}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slot">Available Time Slot</Label>
                  <Select value={selectedSlot} onValueChange={setSelectedSlot} disabled={!selectedTeacher}>
                    <SelectTrigger id="slot">
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSlots.map((slot) => (
                        <SelectItem key={slot.slotID} value={slot.slotID}>
                          {slot.day} - {slot.startTime} to {slot.endTime}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">What do you need help with?</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your questions or topics you'd like to discuss..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Submit Booking Request
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
                  {coursesData.map((course) => (
                    <div key={course.courseID} className="p-3 border rounded-lg">
                      <p className="font-medium">{course.courseName}</p>
                      <p className="text-xs text-muted-foreground">{course.courseID}</p>
                    </div>
                  ))}
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
                  {activeTeachers.map((teacher) => (
                    <div key={teacher.teacherID} className="p-3 border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">{teacher.teacherID}</p>
                      </div>
                      <Badge className="bg-success">Active</Badge>
                    </div>
                  ))}
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
