import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookOpen, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Course, RoutineSlot } from "@/types";
import { toast } from "sonner";

interface TeacherWithProfile {
  id: string;
  teacher_id: string;
  user_id: string;
  profiles: {
    name: string;
  };
}

const BookSession = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<TeacherWithProfile[]>([]);
  const [slots, setSlots] = useState<RoutineSlot[]>([]);
  
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: coursesData } = await supabase.from("courses").select("*");
      const { data: teachersData } = await supabase
        .from("teachers")
        .select("id, teacher_id, user_id")
        .eq("account_status", "Active");

      setCourses(coursesData || []);
      
      if (teachersData) {
        // Fetch profiles separately
        const enrichedTeachers = await Promise.all(
          teachersData.map(async (teacher) => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", teacher.user_id)
              .single();

            return {
              ...teacher,
              profiles: { name: profile?.name || "Unknown" },
            };
          })
        );
        setTeachers(enrichedTeachers);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedTeacher) {
        setSlots([]);
        return;
      }

      const { data } = await supabase
        .from("routine_slots")
        .select("*")
        .eq("teacher_id", selectedTeacher)
        .eq("is_available", true);

      setSlots(data || []);
    };

    fetchSlots();
  }, [selectedTeacher]);

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCourse || !selectedTeacher || !selectedSlot || !selectedDate || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!user) return;

    const slot = slots.find(s => s.id === selectedSlot);
    if (!slot) return;

    const { error } = await supabase
      .from("bookings")
      .insert({
        student_id: user.id,
        teacher_id: selectedTeacher,
        course_id: selectedCourse,
        description: description.trim(),
        booking_date: selectedDate,
        booking_time: slot.start_time,
        status: "Pending",
      });

    if (error) {
      toast.error("Failed to submit booking: " + error.message);
      return;
    }

    toast.success("Booking submitted successfully! Waiting for teacher approval.");
    
    // Reset form
    setSelectedCourse("");
    setSelectedTeacher("");
    setSelectedSlot("");
    setSelectedDate("");
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
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.course_name}
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
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.profiles?.name}
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
                      {slots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {slot.day} - {slot.start_time} to {slot.end_time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Preferred Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
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
                  {courses.map((course) => (
                    <div key={course.id} className="p-3 border rounded-lg">
                      <p className="font-medium">{course.course_name}</p>
                      <p className="text-xs text-muted-foreground">{course.course_id}</p>
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
                  {teachers.map((teacher) => (
                    <div key={teacher.id} className="p-3 border rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-medium">{teacher.profiles?.name}</p>
                        <p className="text-xs text-muted-foreground">{teacher.teacher_id}</p>
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
