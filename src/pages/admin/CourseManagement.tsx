import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Plus, Loader2, AlertCircle } from "lucide-react";
import { courseService } from "@/services/courseService";
import { useCourses } from "@/hooks/useCourses";
import { courseSchema } from "@/lib/validation";
import { toast } from "sonner";

const CourseManagement = () => {
  const { courses, loading, refetch } = useCourses();
  const [newCourseName, setNewCourseName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = courseSchema.safeParse({ courseName: newCourseName });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    const newCourseId = `C${String(courses.length + 1).padStart(3, "0")}`;

    setIsSubmitting(true);
    const { error: submitError } = await courseService.addCourse(newCourseName, newCourseId);

    if (submitError) {
      toast.error("Failed to add course");
      setIsSubmitting(false);
      return;
    }

    setNewCourseName("");
    toast.success("Course added successfully!");
    setIsSubmitting(false);
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Course Management</h1>
          <p className="text-muted-foreground">Add and manage available courses</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCourse} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="course-name" className="sr-only">
                    Course Name
                  </Label>
                  <Input
                    id="course-name"
                    placeholder="Enter course name (e.g., Database Systems)"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    maxLength={200}
                    className={error ? "border-destructive" : ""}
                  />
                  {error && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </p>
                  )}
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Course
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available Courses ({courses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No courses added yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{course.course_name}</p>
                        <p className="text-xs text-muted-foreground">{course.course_id}</p>
                      </div>
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

export default CourseManagement;
