import { MapPin, Users, Settings, Edit, Calendar, AlertCircle, Trash2 } from 'lucide-react';
import { Card } from '../ui/card';
import type { VenueResponse } from '../../types/api/venue';
import type { EventResponse } from '../../../event-organization/types/api/event';
import { getVenueTypeColor, getVenueTypeName } from '../../utils/venueUtils';

interface VenueListProps {
  venues: VenueResponse[];
  events: EventResponse[];
  selectedEventFilter: number;
  onVenueSelect: (venue: VenueResponse) => void;
  onVenueEdit: (venue: VenueResponse) => void;
  onVenueConfigure: (venue: VenueResponse) => void;
  onVenueDelete: (venueId: number, venueName?: string) => void;
}

const VenueList = ({ 
  venues, 
  events, 
  selectedEventFilter, 
  onVenueSelect, 
  onVenueEdit,
  onVenueConfigure,
  onVenueDelete
}: VenueListProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <h3 className="text-xl font-semibold text-white">Venues</h3>
        <div className="flex items-center gap-4">
          {selectedEventFilter !== 0 && (
            <span className="text-neutral-400 text-sm">
              Filtered by: {events.find(e => e.id === selectedEventFilter)?.name}
            </span>
          )}
          <p className="text-neutral-400 text-sm">{venues.length} venue(s) found</p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {venues.map((venue) => {
            const event = events.find(e => e.id === venue.eventId);
            
            return (
              <Card
                key={venue.venueId}
                className="group p-6 relative border border-neutral-800 hover:border-lime-500/50 transition-all duration-200 cursor-pointer"
                onClick={() => onVenueSelect(venue)}
              >
                {/* Action Buttons - Always Visible */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVenueConfigure(venue);
                    }}
                    className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-200"
                    title="Configure seat layout"
                  >
                    <Settings className="w-4 h-4 text-neutral-400 hover:text-lime-400 transition-colors" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVenueEdit(venue);
                    }}
                    className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-200"
                    title="Edit venue"
                  >
                    <Edit className="w-4 h-4 text-neutral-400 hover:text-lime-400 transition-colors" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onVenueDelete(venue.venueId, venue.name);
                    }}
                    className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
                    title="Delete venue"
                  >
                    <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-400 transition-colors" />
                  </button>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30 mr-4">
                      <MapPin className="w-6 h-6 text-lime-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-lime-400 transition-colors">
                        {venue.name || 'Unnamed Venue'}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVenueTypeColor(venue.venueType)}`}>
                          {getVenueTypeName(venue.venueType)}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300">
                          Event: {event?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Event and Capacity in one row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Event Information */}
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-white text-sm font-medium block">
                            {event?.name || 'No Event'}
                          </span>
                          <span className="text-neutral-400 text-xs">
                            {event?.startDate && new Date(event.startDate).toLocaleDateString()} - {event?.endDate && new Date(event.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Capacity Information */}
                    <div className="space-y-1">
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-lime-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-lime-400 text-sm font-medium block">
                            {(venue.capacity || 0).toLocaleString()} capacity
                          </span>
                          <span className="text-neutral-400 text-xs">Total Capacity</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location Information - Full width */}
                  <div className="space-y-1">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                      {venue.city && venue.address ? (
                        <div>
                          <span className="text-white text-sm font-medium block">
                            {venue.city}, {venue.address}
                          </span>
                          <span className="text-neutral-400 text-xs">Location</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-400" />
                          <span className="text-orange-400 text-sm font-medium">Location Not Specified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {venues.length === 0 && (
          <div className="text-center py-16 text-neutral-400">
            <MapPin size={64} className="mx-auto mb-4 opacity-50" />
            <h4 className="text-xl mb-2">No venues found</h4>
            <p className="text-base">
              {selectedEventFilter !== 0 
                ? 'Try adjusting your search criteria or event filter' 
                : 'No venues available in the system'
              }
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default VenueList;