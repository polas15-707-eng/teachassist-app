import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { teacherService } from "@/services/teacherService";
import { useTeacherSlots } from "@/hooks/useTeachers";
import { routineSlotSchema } from "@/lib/validation";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const RoutineManagement = () => {
  const { currentUser } = useAuth();
  const { slots, loading, refetch } = useTeacherSlots(currentUser?.teacher?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [newSlot, setNewSlot] = useState({
    day: "Monday" as typeof DAYS[number],
    startTime: "09:00",
    endTime: "10:00",
  });
  const [errors, setErrors] = useState<{ day?: string; startTime?: string; endTime?: string }>({});

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = routineSlotSchema.safeParse(newSlot);
    if (!result.success) {
      const newErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        newErrors[err.path[0] as keyof typeof errors] = err.message;
      });
      setErrors(newErrors);
      return;
    }

    if (!currentUser?.teacher?.id) return;

    setIsSubmitting(true);
    const { error } = await teacherService.addSlot({
      teacherId: currentUser.teacher.id,
      day: newSlot.day,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
    });

    if (error) {
      toast.error("Failed to add slot");
      setIsSubmitting(false);
      return;
    }

    toast.success("Time slot added successfully!");
    setIsSubmitting(false);
    refetch();
  };

  const handleDeleteSlot = async (slotId: string) => {
    setDeletingId(slotId);
    const { error } = await teacherService.deleteSlot(slotId);

    if (error) {
      toast.error("Failed to delete slot");
      setDeletingId(null);
      return;
    }

    toast.success("Time slot removed");
    setDeletingId(null);
    refetch();
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.day]) acc[slot.day] = [];
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, typeof slots>);

  if (!currentUser?.teacher) {
    return (
      <DashboardLayout>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Routine</h1>
          <p className="text-muted-foreground">Your teacher account is pending approval.</p>
        </div>
      </DashboardLayout>
    );
  }

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
          <h1 className="text-3xl font-bold text-foreground mb-2">My Routine</h1>
          <p className="text-muted-foreground">Manage your availability schedule</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Time Slot</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day">Day</Label>
                  <Select 
                    value={newSlot.day} 
                    onValueChange={(value: typeof DAYS[number]) => setNewSlot({ ...newSlot, day: value })}
                  >
                    <SelectTrigger id="day" className={errors.day ? "border-destructive" : ""}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.day && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.day}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className={errors.startTime ? "border-destructive" : ""}
                  />
                  {errors.startTime && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.startTime}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className={errors.endTime ? "border-destructive" : ""}
                  />
                  {errors.endTime && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.endTime}
                    </p>
                  )}
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Add Slot
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {DAYS.map((day) => (
                <div key={day} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">{day}</h3>
                  {groupedSlots[day]?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {groupedSlots[day].map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between p-3 border rounded bg-card"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {slot.start_time} - {slot.end_time}
                            </p>
                            <Badge
                              variant={slot.is_available ? "default" : "secondary"}
                              className="text-xs mt-1"
                            >
                              {slot.is_available ? "Available" : "Booked"}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSlot(slot.id)}
                            disabled={deletingId === slot.id}
                          >
                            {deletingId === slot.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No slots scheduled</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default RoutineManagement;
