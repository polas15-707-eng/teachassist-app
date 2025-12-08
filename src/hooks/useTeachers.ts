import { useState, useEffect, useCallback } from "react";
import { teacherService, TeacherWithProfile } from "@/services/teacherService";
import { RoutineSlot } from "@/types";

export function useTeachers() {
  const [teachers, setTeachers] = useState<TeacherWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    const data = await teacherService.getAllTeachers();
    setTeachers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const pendingTeachers = teachers.filter((t) => t.account_status === "Pending");
  const activeTeachers = teachers.filter((t) => t.account_status === "Active");

  return {
    teachers,
    pendingTeachers,
    activeTeachers,
    loading,
    refetch: fetchTeachers,
  };
}

export function useActiveTeachers() {
  const [teachers, setTeachers] = useState<TeacherWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await teacherService.getActiveTeachers();
      setTeachers(data);
      setLoading(false);
    };
    fetch();
  }, []);

  return { teachers, loading };
}

export function useTeacherSlots(teacherId: string | undefined) {
  const [slots, setSlots] = useState<RoutineSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    const data = await teacherService.getTeacherSlots(teacherId);
    setSlots(data);
    setLoading(false);
  }, [teacherId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return { slots, loading, refetch: fetchSlots };
}

export function useAvailableSlots(teacherId: string | undefined) {
  const [slots, setSlots] = useState<RoutineSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!teacherId) {
        setSlots([]);
        setLoading(false);
        return;
      }
      const data = await teacherService.getAvailableSlots(teacherId);
      setSlots(data);
      setLoading(false);
    };
    fetch();
  }, [teacherId]);

  return { slots, loading };
}
