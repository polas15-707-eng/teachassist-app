import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { routineSlotsData } from "@/data/mockData";
import { RoutineSlot, Teacher } from "@/types";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const RoutineManagement = () => {
  const { currentUser } = useAuth();
  const teacher = currentUser as Teacher;
  const [slots, setSlots] = useState<RoutineSlot[]>(
    routineSlotsData.filter(s => s.teacherID === teacher.teacherID)
  );

  const [newSlot, setNewSlot] = useState({
    day: "Monday",
    startTime: "09:00",
    endTime: "10:00",
  });

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();

    const newSlotData: RoutineSlot = {
      slotID: `slot-${Date.now()}`,
      teacherID: teacher.teacherID,
      day: newSlot.day,
      startTime: newSlot.startTime,
      endTime: newSlot.endTime,
      isAvailable: true,
    };

    setSlots([...slots, newSlotData]);
    routineSlotsData.push(newSlotData);
    toast.success("Time slot added successfully!");
  };

  const handleDeleteSlot = (slotId: string) => {
    setSlots(slots.filter(s => s.slotID !== slotId));
    const index = routineSlotsData.findIndex(s => s.slotID === slotId);
    if (index > -1) {
      routineSlotsData.splice(index, 1);
    }
    toast.success("Time slot removed");
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.day]) {
      acc[slot.day] = [];
    }
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, RoutineSlot[]>);

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
                          key={slot.slotID}
                          className="flex items-center justify-between p-3 border rounded bg-card"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {slot.startTime} - {slot.endTime}
                            </p>
                            <Badge
                              variant={slot.isAvailable ? "default" : "secondary"}
                              className="text-xs mt-1"
                            >
                              {slot.isAvailable ? "Available" : "Booked"}
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSlot(slot.slotID)}
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
