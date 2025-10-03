import { MapPin, Users, Settings, Edit } from 'lucide-react';
import { Card } from '../card';
import type { VenueResponse } from '../../types/api/venue';
import type { EventResponse } from '../../../event-organization/types/api/event';
import { getVenueTypeColor, getVenueTypeName } from '../../utils/venueUtils';

interface VenueListProps {
  venues: VenueResponse[];
  events: EventResponse[];
  selectedEventFilter: number;
  onVenueSelect: (venue: VenueResponse) => void;
  onVenueEdit: (venue: VenueResponse) => void;
}

const VenueList = ({ 
  venues, 
  events, 
  selectedEventFilter, 
  onVenueSelect, 
  onVenueEdit 
}: VenueListProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-800">
        <h3 className="text-xl font-semibold text-white mb-4">Venues</h3>
        <div className="flex items-center gap-4">
          {selectedEventFilter !== 0 && (
            <span className="text-neutral-400 text-sm">
              Filtered by: {events.find(e => e.id === selectedEventFilter)?.name}
            </span>
          )}
          <p className="text-neutral-400 text-sm">{venues.length} venue(s) found</p>
        </div>
      </div>
      
      <div className="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
          {venues.map((venue) => (
            <Card
              key={venue.venueId}
              className="group p-6 relative cursor-pointer hover:border-lime-500/50 transition-all duration-200"
              onClick={() => onVenueSelect(venue)}
            >
              {/* Dugmad u gornjem desnom uglu */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVenueSelect(venue);
                  }}
                  className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-200"
                  title="Configure seat layout"
                >
                  <Settings className="w-5 h-5 text-neutral-400 hover:text-lime-400 transition-colors" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVenueEdit(venue);
                  }}
                  className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-200"
                  title="Edit venue"
                >
                  <Edit className="w-5 h-5 text-neutral-400 hover:text-lime-400 transition-colors" />
                </button>
              </div>

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-lime-500/20 p-3 rounded-xl mr-4">
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
                        Event: {events.find(e => e.id === venue.eventId)?.name || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-col justify-between items-center text-neutral-300">
                <div className="flex items-center mb-3">
                  <Users className="w-5 h-5 mr-2 text-neutral-400" />
                  <span className="text-base">Capacity: {(venue.capacity || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-neutral-400" />
                  <span className="text-base">{venue.city || 'Unknown City'}, {venue.address}</span>
                </div>
              </div>
            </Card>
          ))}
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