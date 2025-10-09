import { Calendar, MapPin, Users, Ticket, Plus } from "lucide-react";
import { Card } from "../../../ticket-sales/components/ui/card";
import type { ClientEventDto } from "../../../shared/types/api/event";

interface EventCardProps {
  event: ClientEventDto;
  onViewDetails: (event: ClientEventDto) => void;
}

export const EventCard = ({ event, onViewDetails }: EventCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPriceRange = (event: ClientEventDto): string => {
    if (event.minPrice === 0 && event.maxPrice === 0) {
      return "Free";
    }
    if (event.minPrice === event.maxPrice) {
      return formatCurrency(event.minPrice);
    }
    return `${formatCurrency(event.minPrice)} - ${formatCurrency(event.maxPrice)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'soldout': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const getEventLocation = (event: ClientEventDto): string => {
    if (event.venueNames && event.venueNames.length > 0) {
      return event.venueNames.join(", ");
    }
    return "Location to be announced";
  };

  const getPerformersText = (event: ClientEventDto): string => {
    if (event.performerNames && event.performerNames.length > 0) {
      return event.performerNames.join(", ");
    }
    return "Performers to be announced";
  };

  return (
    <Card hover={true} className="p-6 group cursor-pointer transition-all duration-300 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-400/20 rounded-xl border border-orange-500/30">
            <Ticket className="w-6 h-6 text-orange-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-medium text-lg group-hover:text-orange-400 transition-colors line-clamp-2">
              {event.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status || '')}`}>
                {event.status?.toLowerCase() || 'unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {event.description && (
        <p className="text-neutral-400 text-sm mb-4 line-clamp-2 flex-1">{event.description}</p>
      )}

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <span className="text-neutral-300 text-sm">
            {formatDate(event.startDate)} at {formatTime(event.startDate)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <span className="text-neutral-300 text-sm line-clamp-1">{getEventLocation(event)}</span>
        </div>
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-orange-400 flex-shrink-0" />
          <span className="text-neutral-300 text-sm line-clamp-1">{getPerformersText(event)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-neutral-800 mt-auto">
        <div className="text-orange-400 font-bold text-lg">
          {getPriceRange(event)}
        </div>
        <div className="flex items-center gap-2 text-neutral-400 text-sm">
          <Ticket className="w-4 h-4" />
          {event.availableTickets} available
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(event);
          }}
          className="flex-1 px-4 py-3 rounded-xl bg-orange-400 text-black font-medium hover:bg-orange-500 transition-all duration-200 shadow-lg text-sm flex items-center justify-center gap-2"
        >
          <Plus size={16} />
          View Details
        </button>
      </div>
    </Card>
  );
};