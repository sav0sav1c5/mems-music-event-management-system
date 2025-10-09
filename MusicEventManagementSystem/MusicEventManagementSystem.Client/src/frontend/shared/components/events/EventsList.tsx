import { Ticket, Loader2 } from "lucide-react";
import { Card } from "../../../ticket-sales/components/ui/card";
import { EventCard } from "./EventCard";
import type { ClientEventDto } from "../../../shared/types/api/event";

interface EventsListProps {
  loading: boolean;
  events: ClientEventDto[];
  onViewDetails: (event: ClientEventDto) => void;
  onClearFilters: () => void;
}

export const EventsList = ({ 
  loading, 
  events, 
  onViewDetails, 
  onClearFilters 
}: EventsListProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
          <p className="text-neutral-400 text-base">Loading events...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="text-center py-16">
        <div className="p-4 bg-neutral-800/50 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Ticket className="w-8 h-8 text-neutral-400" />
        </div>
        <p className="text-neutral-400 text-base mb-2">No events found</p>
        <p className="text-neutral-500 text-sm mb-6">Try adjusting your search criteria</p>
        <button 
          onClick={onClearFilters}
          className="px-6 py-3 rounded-xl bg-orange-400 text-black font-medium hover:bg-orange-500 transition-all duration-200 shadow-lg"
        >
          Clear Filters
        </button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};