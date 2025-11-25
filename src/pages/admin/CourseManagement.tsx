import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Plus } from "lucide-react";
import { coursesData } from "@/data/mockData";
import { Course } from "@/types";
import { toast } from "sonner";

const CourseManagement = () => {
  const [courses, setCourses] = useState<Course[]>(coursesData);
  const [newCourseName, setNewCourseName] = useState("");

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) {
      toast.error("Please enter a course name");
      return;
    }

    const newCourseId = `C${String(courses.length + 1).padStart(3, '0')}`;
    const newCourse: Course = {
      courseID: newCourseId,
      courseName: newCourseName.trim(),
    };

    setCourses([...courses, newCourse]);
    coursesData.push(newCourse);
    setNewCourseName("");
    toast.success("Course added successfully!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Course Management</h1>
          <p className="text-muted-foreground">Add and manage available courses</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCourse} className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="course-name" className="sr-only">Course Name</Label>
                <Input
                  id="course-name"
                  placeholder="Enter course name (e.g., Database Systems)"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                />
              </div>
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Courses ({courses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div
                  key={course.courseID}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{course.courseName}</p>
                      <p className="text-xs text-muted-foreground">{course.courseID}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CourseManagement;
