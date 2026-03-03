import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { officeHoursApi, OfficeHours } from "@/services/api";

const DAYS_OF_WEEK = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

const TIME_OPTIONS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00",
];

const SLOT_DURATIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
];

interface OfficeHoursManagerProps {
  className?: string;
}

export const OfficeHoursManager = ({ className }: OfficeHoursManagerProps) => {
  const [officeHours, setOfficeHours] = useState<OfficeHours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHours, setEditingHours] = useState<OfficeHours | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    day_of_week: 0,
    start_time: "09:00",
    end_time: "17:00",
    is_available: true,
    slot_duration: 30,
    location: "",
    notes: "",
  });

  // Fetch office hours
  const fetchOfficeHours = async () => {
    setIsLoading(true);
    try {
      const response = await officeHoursApi.getMy();
      setOfficeHours(response.office_hours || []);
    } catch (error) {
      console.error("Failed to fetch office hours:", error);
      toast({
        title: "Error",
        description: "Failed to load office hours",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficeHours();
  }, []);

  const handleOpenDialog = (hours?: OfficeHours) => {
    if (hours) {
      setEditingHours(hours);
      setFormData({
        day_of_week: hours.day_of_week,
        start_time: hours.start_time,
        end_time: hours.end_time,
        is_available: hours.is_available,
        slot_duration: hours.slot_duration,
        location: hours.location || "",
        notes: hours.notes || "",
      });
    } else {
      setEditingHours(null);
      setFormData({
        day_of_week: 0,
        start_time: "09:00",
        end_time: "17:00",
        is_available: true,
        slot_duration: 30,
        location: "",
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    // Validate times
    if (formData.start_time >= formData.end_time) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingHours) {
        // Update existing
        await officeHoursApi.update(editingHours.id, {
          day_of_week: formData.day_of_week,
          start_time: formData.start_time,
          end_time: formData.end_time,
          is_available: formData.is_available,
          slot_duration: formData.slot_duration,
          location: formData.location || undefined,
          notes: formData.notes || undefined,
        });
        toast({
          title: "Updated",
          description: "Office hours updated successfully",
        });
      } else {
        // Create new
        await officeHoursApi.create({
          day_of_week: formData.day_of_week,
          start_time: formData.start_time,
          end_time: formData.end_time,
          slot_duration: formData.slot_duration,
          location: formData.location || undefined,
          notes: formData.notes || undefined,
        });
        toast({
          title: "Created",
          description: "Office hours added successfully",
        });
      }
      setDialogOpen(false);
      fetchOfficeHours();
    } catch (error) {
      console.error("Failed to save office hours:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save office hours",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete these office hours?")) {
      return;
    }

    try {
      await officeHoursApi.delete(id);
      toast({
        title: "Deleted",
        description: "Office hours removed successfully",
      });
      fetchOfficeHours();
    } catch (error) {
      console.error("Failed to delete office hours:", error);
      toast({
        title: "Error",
        description: "Failed to delete office hours",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (hours: OfficeHours) => {
    try {
      await officeHoursApi.update(hours.id, {
        is_available: !hours.is_available,
      });
      fetchOfficeHours();
      toast({
        title: hours.is_available ? "Disabled" : "Enabled",
        description: `${hours.day_name} hours ${hours.is_available ? "disabled" : "enabled"}`,
      });
    } catch (error) {
      console.error("Failed to toggle availability:", error);
    }
  };

  // Group hours by day
  const hoursByDay = officeHours.reduce((acc, hours) => {
    if (!acc[hours.day_of_week]) {
      acc[hours.day_of_week] = [];
    }
    acc[hours.day_of_week].push(hours);
    return acc;
  }, {} as Record<number, OfficeHours[]>);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Office Hours
            </CardTitle>
            <CardDescription>
              Manage your availability for student appointments
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Hours
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : officeHours.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No office hours set up yet</p>
            <p className="text-sm mt-1">Click "Add Hours" to set your availability</p>
          </div>
        ) : (
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => {
              const dayHours = hoursByDay[day.value] || [];
              if (dayHours.length === 0) return null;

              return (
                <motion.div
                  key={day.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4"
                >
                  <h4 className="font-semibold text-sm mb-3">{day.label}</h4>
                  <div className="space-y-2">
                    {dayHours.map((hours) => (
                      <div
                        key={hours.id}
                        className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                          hours.is_available
                            ? "bg-success/10 border border-success/20"
                            : "bg-muted/50 border border-muted"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={hours.is_available}
                            onCheckedChange={() => toggleAvailability(hours)}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {formatTime(hours.start_time)} - {formatTime(hours.end_time)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {hours.slot_duration} min slots
                              </Badge>
                            </div>
                            {hours.location && (
                              <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {hours.location}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(hours)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(hours.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingHours ? "Edit Office Hours" : "Add Office Hours"}
              </DialogTitle>
              <DialogDescription>
                Set your availability for a specific day
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  value={String(formData.day_of_week)}
                  onValueChange={(v) =>
                    setFormData({ ...formData, day_of_week: parseInt(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={String(day.value)}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Select
                    value={formData.start_time}
                    onValueChange={(v) =>
                      setFormData({ ...formData, start_time: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Select
                    value={formData.end_time}
                    onValueChange={(v) =>
                      setFormData({ ...formData, end_time: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {formatTime(time)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Appointment Duration</Label>
                <Select
                  value={String(formData.slot_duration)}
                  onValueChange={(v) =>
                    setFormData({ ...formData, slot_duration: parseInt(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SLOT_DURATIONS.map((duration) => (
                      <SelectItem
                        key={duration.value}
                        value={String(duration.value)}
                      >
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location (optional)</Label>
                <Input
                  placeholder="e.g., Office 101, Academic Building"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  placeholder="e.g., Available for walk-ins"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editingHours ? "Update" : "Create"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default OfficeHoursManager;
