import { useState, useEffect, useCallback } from "react";
import { courseService } from "@/services/courseService";
import { Course } from "@/types";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const data = await courseService.getAllCourses();
    setCourses(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { courses, loading, refetch: fetchCourses };
}
