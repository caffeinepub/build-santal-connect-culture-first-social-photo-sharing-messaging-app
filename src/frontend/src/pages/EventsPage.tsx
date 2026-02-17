import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, MapPin, Loader2, ArrowRight, Plus } from 'lucide-react';
import { useGetAllEvents, useAdminAddEvent, useIsCallerAdmin } from '../hooks/useQueries';
import EventForm from '../components/events/EventForm';
import { toast } from 'sonner';

export default function EventsPage() {
  const navigate = useNavigate();
  const { data: events, isLoading } = useGetAllEvents();
  const { data: isAdmin } = useIsCallerAdmin();
  const addEvent = useAdminAddEvent();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddEvent = async (data: {
    name: string;
    date: Date;
    description: string;
    location: string;
  }) => {
    try {
      const dateInNanoseconds = BigInt(data.date.getTime()) * BigInt(1000000);
      await addEvent.mutateAsync({
        name: data.name,
        date: dateInNanoseconds,
        description: data.description,
        location: data.location || null,
      });
      toast.success('Event created successfully!');
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event');
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Events</h1>
          <p className="text-muted-foreground">Upcoming festivals and gatherings</p>
        </div>
        {isAdmin && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <EventForm onSubmit={handleAddEvent} onCancel={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {events && events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No upcoming events</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events?.map((event, index) => {
            const eventDate = new Date(Number(event.date) / 1000000);
            const isUpcoming = eventDate > new Date();

            return (
              <Card key={index} className={isUpcoming ? 'border-primary/50' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-4">
                    <span>{event.name}</span>
                    {isUpcoming && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">Upcoming</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{eventDate.toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  <p className="text-sm line-clamp-2">{event.description}</p>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: '/event/$eventName', params: { eventName: event.name } })}
                  >
                    View Details <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
