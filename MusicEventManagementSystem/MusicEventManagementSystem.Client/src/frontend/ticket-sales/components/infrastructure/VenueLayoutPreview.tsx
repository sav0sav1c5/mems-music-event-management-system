import { MapPin } from 'lucide-react';
import { Card } from '../card';
import type { VenueResponse } from '../../types/api/venue';
import type { SegmentResponse } from '../../types/api/segment';
import type { ZoneResponse } from '../../types/api/zone';
import { getSegmentTypeName } from '../../utils/venueUtils';

interface VenueLayoutPreviewProps {
  venue: VenueResponse;
  segments: SegmentResponse[];
  zones: ZoneResponse[];
}

const VenueLayoutPreview = ({ venue, segments, zones }: VenueLayoutPreviewProps) => {
  // Group zones by segment
  const zonesBySegment = zones.reduce((acc, zone) => {
    if (!acc[zone.segmentId]) {
      acc[zone.segmentId] = [];
    }
    acc[zone.segmentId].push(zone);
    return acc;
  }, {} as Record<number, ZoneResponse[]>);

  return (
    <div className="flex flex-col h-full">      
      {/* Seating Areas with Zones */}
      <div className="flex-1 overflow-y-auto">
        {segments.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {segments.map((segment) => {
              const segmentZones = zonesBySegment[segment.segmentId] || [];
              
              return (
                <Card
                  key={segment.segmentId}
                  className="p-5 bg-neutral-800 border border-neutral-700 hover:border-lime-500/50 transition-all duration-300"
                >
                  {/* Segment Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-700">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-lime-500 shadow-lg shadow-lime-500/50"></div>
                      <div>
                        <h4 className="font-bold text-white text-lg">{segment.name}</h4>
                        <p className="text-neutral-400 text-sm">
                          {segment.capacity.toLocaleString()} seats • {getSegmentTypeName(segment.segmentType)}
                        </p>
                      </div>
                    </div>
                    {segmentZones.length > 0 && (
                      <div className="px-3 py-1 bg-lime-500/20 border border-lime-500/30 rounded-full">
                        <span className="text-lime-400 text-sm font-medium">
                          {segmentZones.length} zone{segmentZones.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Zones Grid */}
                  {segmentZones.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {segmentZones.map((zone) => (
                        <div
                          key={zone.zoneId}
                          className="p-3 bg-neutral-900/60 border border-neutral-700 rounded-xl hover:border-lime-500/50 hover:bg-neutral-800/60 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-lime-400 shadow-sm shadow-lime-400/50"></div>
                            <h5 className="font-semibold text-white text-sm group-hover:text-lime-400 transition-colors">
                              {zone.name}
                            </h5>
                          </div>
                          <div className="space-y-1">
                            <p className="text-neutral-400 text-xs">
                              <span className="text-lime-400 font-medium">${zone.basePrice}</span> base price
                            </p>
                            <p className="text-neutral-400 text-xs">
                              {zone.capacity} seats
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-neutral-500">
                      <MapPin size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No zones configured for this segment</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-neutral-400">
            <MapPin size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No segments configured</p>
            <p className="text-sm">Add segments to see the venue layout</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VenueLayoutPreview;