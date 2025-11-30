import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RoutineSlot } from "@/types";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const RoutineManagement = () => {
  const { currentUser } = useAuth();
  const [slots, setSlots] = useState<RoutineSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const [newSlot, setNewSlot] = useState({
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
  });

  const fetchSlots = async () => {
    if (!currentUser?.teacher?.id) return;

    const { data, error } = await supabase
      .from("routine_slots")
      .select("*")
      .eq("teacher_id", currentUser.teacher.id)
      .order("day");

    if (error) {
      toast.error("Failed to fetch slots");
      return;
    }

    setSlots(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();
  }, [currentUser]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser?.teacher?.id) return;

    const { error } = await supabase
      .from("routine_slots")
      .insert({
        teacher_id: currentUser.teacher.id,
        day: newSlot.day,
        start_time: newSlot.startTime,
        end_time: newSlot.endTime,
        is_available: true,
      });

    if (error) {
      toast.error("Failed to add slot");
      return;
    }

    toast.success("Time slot added successfully!");
    fetchSlots();
  };

  const handleDeleteSlot = async (slotId: string) => {
    const { error } = await supabase
      .from("routine_slots")
      .delete()
      .eq("id", slotId);

    if (error) {
      toast.error("Failed to delete slot");
      return;
    }

    toast.success("Time slot removed");
    fetchSlots();
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.day]) {
      acc[slot.day] = [];
    }
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, RoutineSlot[]>);

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
        <p className="text-muted-foreground">Loading...</p>
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
                  <Select value={newSlot.day} onValueChange={(value) => setNewSlot({ ...newSlot, day: value })}>
                    <SelectTrigger id="day">
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
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
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
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
