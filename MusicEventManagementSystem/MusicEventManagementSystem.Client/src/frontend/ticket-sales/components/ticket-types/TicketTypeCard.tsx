import { Card } from '../ui/card';
import { Edit, Trash2, Target, Users, Calendar, MapPin, AlertCircle } from 'lucide-react';
import type { TicketTypeResponse, ZoneResponse } from '../../types';
import type { EventResponse } from '../../../event-organization/types/api/event';

interface TicketTypeCardProps {
  ticketType: TicketTypeResponse;
  events: EventResponse[];
  zones: ZoneResponse[];
  onEdit: (ticketType: TicketTypeResponse) => void;
  onDelete: (ticketTypeId: number, ticketTypeName?: string) => void;
}

const formatTicketTypeStatus = (status: number): string => {
  switch (status) {
    case 0: return 'Active';
    case 1: return 'Inactive';
    case 2: return 'Sold Out';
    case 3: return 'Coming Soon';
    case 4: return 'Suspended';
    default: return 'Unknown';
  }
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 1: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    case 2: return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 3: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 4: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const TicketTypeCard = ({
  ticketType,
  events,
  zones,
  onEdit,
  onDelete
}: TicketTypeCardProps) => {
  const event = events.find(e => e.id === ticketType.eventId);
  const zone = zones.find(z => z.zoneId === ticketType.zoneId);

  return (
    <Card
      className="group p-6 relative border border-neutral-800 hover:border-lime-500/50 transition-all duration-200"
    >
      {/* Action Buttons - Always Visible */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(ticketType);
          }}
          className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-200"
          title="Edit ticket type"
        >
          <Edit className="w-4 h-4 text-neutral-400 hover:text-lime-400 transition-colors" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(ticketType.ticketTypeId);
          }}
          className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
          title="Delete ticket type"
        >
          <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-400 transition-colors" />
        </button>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30 mr-4">
            <Target className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg group-hover:text-lime-400 transition-colors">
              {ticketType.name || 'Unnamed Ticket Type'}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticketType.status)}`}>
                {formatTicketTypeStatus(ticketType.status)}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300">
                Event: {event?.name || `Event ${ticketType.eventId}`}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Two-column layout for event and zone information */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left column - Event Information */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-white text-sm font-medium block">{event?.name || `Event ${ticketType.eventId}`}</span>
              <span className="text-neutral-400 text-xs">
                {event?.startDate && new Date(event.startDate).toLocaleDateString()} - {event?.endDate && new Date(event.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {/* Available Quantity */}
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-white text-sm font-medium block">
                {ticketType.availableQuantity.toLocaleString()} tickets available
              </span>
            </div>
          </div>
        </div>

        {/* Right column - Zone Information */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" />
            {zone ? (
              <div>
                <span className="text-lime-400 text-sm font-medium block">{zone.name}</span>
                <span className="text-neutral-400 text-xs">
                  Capacity: {zone.capacity.toLocaleString()}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">Zone Not Assigned</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TicketTypeCard;