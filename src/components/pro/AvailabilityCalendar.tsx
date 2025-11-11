import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  useProAvailability, 
  useCreateAvailability, 
  useDeleteAvailability 
} from "@/hooks/useProBookings";
import { Plus, Trash2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AvailabilityCalendarProps {
  proProfileId: string;
}

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export function AvailabilityCalendar({ proProfileId }: AvailabilityCalendarProps) {
  const { data: availability = [] } = useProAvailability(proProfileId);
  const createAvailability = useCreateAvailability();
  const deleteAvailability = useDeleteAvailability();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');

  const handleAddSlot = async () => {
    await createAvailability.mutateAsync({
      pro_profile_id: proProfileId,
      day_of_week: selectedDay,
      start_time: startTime,
      end_time: endTime
    });
    setDialogOpen(false);
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (confirm('Supprimer cette disponibilité ?')) {
      await deleteAvailability.mutateAsync(slotId);
    }
  };

  // Group availability by day
  const availabilityByDay = DAYS.map((dayName, index) => ({
    day: dayName,
    dayOfWeek: index,
    slots: availability.filter((slot: any) => slot.day_of_week === index)
  }));

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Mes disponibilités
            </CardTitle>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availabilityByDay.map((day) => (
              <div key={day.dayOfWeek} className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">{day.day}</h3>
                {day.slots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Non disponible</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {day.slots.map((slot: any) => (
                      <Badge 
                        key={slot.id}
                        variant="secondary"
                        className="flex items-center gap-2"
                      >
                        <span>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Availability Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une disponibilité</DialogTitle>
            <DialogDescription>
              Définissez un créneau horaire pour un jour de la semaine
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Jour de la semaine</Label>
              <Select value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heure de début</Label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Heure de fin</Label>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAddSlot}
              disabled={createAvailability.isPending}
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
