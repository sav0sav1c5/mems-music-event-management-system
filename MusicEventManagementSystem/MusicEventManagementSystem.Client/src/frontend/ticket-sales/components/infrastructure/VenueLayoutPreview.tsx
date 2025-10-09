import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Users, Layers, Box, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '../ui/card';
import SegmentService from '../../services/segmentService';
import ZoneService from '../../services/zoneService';
import type { VenueResponse } from '../../types/api/venue';
import type { SegmentResponse } from '../../types/api/segment';
import type { ZoneResponse } from '../../types/api/zone';
import { getSegmentTypeName, getVenueTypeName } from '../../utils/venueUtils';

interface VenueLayoutViewProps {
  venue: VenueResponse;
  onBack: () => void;
}

const VenueLayoutPreview = ({ venue, onBack }: VenueLayoutViewProps) => {
  const [segments, setSegments] = useState<SegmentResponse[]>([]);
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [hoveredZone, setHoveredZone] = useState<number | null>(null);

  useEffect(() => {
    loadLayoutData();
  }, [venue]);

  const loadLayoutData = async () => {
    try {
      setLoading(true);
      const [segmentsData, allZones] = await Promise.all([
        SegmentService.getSegmentsByVenueId(venue.venueId).catch(() => []),
        ZoneService.getAllZones().catch(() => [])
      ]);
      
      setSegments(segmentsData || []);
      
      const venueZones = allZones.filter(zone => 
        segmentsData.some(segment => segment.segmentId === zone.segmentId)
      );
      setZones(venueZones || []);
    } catch (error) {
      console.error('Error loading layout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const zonesBySegment = zones.reduce((acc, zone) => {
    if (!acc[zone.segmentId]) {
      acc[zone.segmentId] = [];
    }
    acc[zone.segmentId].push(zone);
    return acc;
  }, {} as Record<number, ZoneResponse[]>);

  const totalCapacity = segments.reduce((sum, seg) => sum + seg.capacity, 0);
  const totalZones = zones.length;

  const segmentColors = [
    { bg: 'bg-lime-500/20', border: 'border-lime-500/40', text: 'text-lime-400', hover: 'hover:bg-lime-500/30' },
    { bg: 'bg-blue-500/20', border: 'border-blue-500/40', text: 'text-blue-400', hover: 'hover:bg-blue-500/30' },
    { bg: 'bg-purple-500/20', border: 'border-purple-500/40', text: 'text-purple-400', hover: 'hover:bg-purple-500/30' },
    { bg: 'bg-pink-500/20', border: 'border-pink-500/40', text: 'text-pink-400', hover: 'hover:bg-pink-500/30' },
    { bg: 'bg-orange-500/20', border: 'border-orange-500/40', text: 'text-orange-400', hover: 'hover:bg-orange-500/30' },
    { bg: 'bg-teal-500/20', border: 'border-teal-500/40', text: 'text-teal-400', hover: 'hover:bg-teal-500/30' },
    { bg: 'bg-cyan-500/20', border: 'border-cyan-500/40', text: 'text-cyan-400', hover: 'hover:bg-cyan-500/30' },
    { bg: 'bg-indigo-500/20', border: 'border-indigo-500/40', text: 'text-indigo-400', hover: 'hover:bg-indigo-500/30' },
  ];

  const getSegmentColor = (index: number) => segmentColors[index % segmentColors.length];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-neutral-400">Loading layout...</div>
      </div>
    );
  }

  return (
    <div className="text-white h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl mr-6 transition-colors flex items-center gap-2 text-sm"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{venue.name} - Layout Preview</h1>
              <div className="flex items-center gap-4 text-neutral-400 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{venue.city}, {venue.address}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{totalCapacity.toLocaleString()} capacity</span>
                </div>
                <span>•</span>
                <span>{getVenueTypeName(venue.venueType)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="p-4 bg-neutral-800/40 border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm mb-1">Total Segments</p>
              <p className="text-2xl font-bold text-lime-400">{segments.length}</p>
            </div>
            <div className="p-3 bg-lime-500/20 rounded-xl">
              <Layers className="w-6 h-6 text-lime-400" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-neutral-800/40 border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm mb-1">Total Zones</p>
              <p className="text-2xl font-bold text-lime-400">{totalZones}</p>
            </div>
            <div className="p-3 bg-lime-500/20 rounded-xl">
              <Box className="w-6 h-6 text-lime-400" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-neutral-800/40 border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm mb-1">Total Capacity</p>
              <p className="text-2xl font-bold text-lime-400">{totalCapacity.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-lime-500/20 rounded-xl">
              <Users className="w-6 h-6 text-lime-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Interactive Layout Visualization */}
      <div className="flex-1 overflow-y-auto">
        {segments.length > 0 ? (
          <div className="space-y-6">
            {/* Interactive Seating Map */}
            <div className="bg-neutral-800/40 border border-neutral-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Interactive Seating Map</h3>
                <p className="text-neutral-400 text-sm">Click on segments to view zones</p>
              </div>

              {/* Visual Layout Grid */}
              <div className="relative min-h-[500px] bg-neutral-900 rounded-xl border-2 border-neutral-700 p-8">
                <div className="grid grid-cols-3 gap-4 h-full">
                  {/* Left Side */}
                  <div className="space-y-4">
                    {segments.slice(0, Math.ceil(segments.length / 3)).map((segment, index) => {
                      const color = getSegmentColor(index);
                      const segmentZones = zonesBySegment[segment.segmentId] || [];
                      const isExpanded = selectedSegment === segment.segmentId;
                      
                      return (
                        <div key={segment.segmentId} className="space-y-2">
                          <div
                            onClick={() => setSelectedSegment(isExpanded ? null : segment.segmentId)}
                            className={`${color.bg} ${color.border} border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${color.hover} ${
                              isExpanded ? 'ring-2 ring-lime-400' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`font-bold ${color.text}`}>{segment.name}</h4>
                              {isExpanded ? <ChevronUp className={color.text} size={20} /> : <ChevronDown className={color.text} size={20} />}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-neutral-300">{getSegmentTypeName(segment.segmentType)}</span>
                              <span className="text-neutral-300 font-semibold">{segment.capacity}</span>
                            </div>
                            {segmentZones.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-neutral-700">
                                <span className="text-xs text-neutral-400">{segmentZones.length} zones</span>
                              </div>
                            )}
                          </div>

                          {/* Expanded Zones */}
                          {isExpanded && segmentZones.length > 0 && (
                            <div className="ml-4 space-y-2 animate-fadeIn">
                              {segmentZones.map((zone) => (
                                <div
                                  key={zone.zoneId}
                                  onMouseEnter={() => setHoveredZone(zone.zoneId)}
                                  onMouseLeave={() => setHoveredZone(null)}
                                  className={`bg-neutral-800 border-2 ${
                                    hoveredZone === zone.zoneId ? 'border-lime-400' : 'border-neutral-700'
                                  } rounded-lg p-3 transition-all duration-200 cursor-pointer hover:bg-neutral-700`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-white font-medium text-sm">{zone.name}</span>
                                    <span className="px-2 py-1 bg-lime-500/20 text-lime-400 text-xs rounded-full font-bold">
                                      ${zone.basePrice}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                                    <Users className="w-3 h-3" />
                                    <span>{zone.capacity} seats</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Center */}
                  <div className="space-y-4">
                    {segments.slice(Math.ceil(segments.length / 3), Math.ceil(segments.length * 2 / 3)).map((segment, idx) => {
                      const index = Math.ceil(segments.length / 3) + idx;
                      const color = getSegmentColor(index);
                      const segmentZones = zonesBySegment[segment.segmentId] || [];
                      const isExpanded = selectedSegment === segment.segmentId;
                      
                      return (
                        <div key={segment.segmentId} className="space-y-2">
                          <div
                            onClick={() => setSelectedSegment(isExpanded ? null : segment.segmentId)}
                            className={`${color.bg} ${color.border} border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${color.hover} ${
                              isExpanded ? 'ring-2 ring-lime-400' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`font-bold ${color.text}`}>{segment.name}</h4>
                              {isExpanded ? <ChevronUp className={color.text} size={20} /> : <ChevronDown className={color.text} size={20} />}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-neutral-300">{getSegmentTypeName(segment.segmentType)}</span>
                              <span className="text-neutral-300 font-semibold">{segment.capacity}</span>
                            </div>
                            {segmentZones.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-neutral-700">
                                <span className="text-xs text-neutral-400">{segmentZones.length} zones</span>
                              </div>
                            )}
                          </div>

                          {isExpanded && segmentZones.length > 0 && (
                            <div className="ml-4 space-y-2 animate-fadeIn">
                              {segmentZones.map((zone) => (
                                <div
                                  key={zone.zoneId}
                                  onMouseEnter={() => setHoveredZone(zone.zoneId)}
                                  onMouseLeave={() => setHoveredZone(null)}
                                  className={`bg-neutral-800 border-2 ${
                                    hoveredZone === zone.zoneId ? 'border-lime-400' : 'border-neutral-700'
                                  } rounded-lg p-3 transition-all duration-200 cursor-pointer hover:bg-neutral-700`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-white font-medium text-sm">{zone.name}</span>
                                    <span className="px-2 py-1 bg-lime-500/20 text-lime-400 text-xs rounded-full font-bold">
                                      ${zone.basePrice}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                                    <Users className="w-3 h-3" />
                                    <span>{zone.capacity} seats</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Right Side */}
                  <div className="space-y-4">
                    {segments.slice(Math.ceil(segments.length * 2 / 3)).map((segment, idx) => {
                      const index = Math.ceil(segments.length * 2 / 3) + idx;
                      const color = getSegmentColor(index);
                      const segmentZones = zonesBySegment[segment.segmentId] || [];
                      const isExpanded = selectedSegment === segment.segmentId;
                      
                      return (
                        <div key={segment.segmentId} className="space-y-2">
                          <div
                            onClick={() => setSelectedSegment(isExpanded ? null : segment.segmentId)}
                            className={`${color.bg} ${color.border} border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${color.hover} ${
                              isExpanded ? 'ring-2 ring-lime-400' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className={`font-bold ${color.text}`}>{segment.name}</h4>
                              {isExpanded ? <ChevronUp className={color.text} size={20} /> : <ChevronDown className={color.text} size={20} />}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-neutral-300">{getSegmentTypeName(segment.segmentType)}</span>
                              <span className="text-neutral-300 font-semibold">{segment.capacity}</span>
                            </div>
                            {segmentZones.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-neutral-700">
                                <span className="text-xs text-neutral-400">{segmentZones.length} zones</span>
                              </div>
                            )}
                          </div>

                          {isExpanded && segmentZones.length > 0 && (
                            <div className="ml-4 space-y-2 animate-fadeIn">
                              {segmentZones.map((zone) => (
                                <div
                                  key={zone.zoneId}
                                  onMouseEnter={() => setHoveredZone(zone.zoneId)}
                                  onMouseLeave={() => setHoveredZone(null)}
                                  className={`bg-neutral-800 border-2 ${
                                    hoveredZone === zone.zoneId ? 'border-lime-400' : 'border-neutral-700'
                                  } rounded-lg p-3 transition-all duration-200 cursor-pointer hover:bg-neutral-700`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-white font-medium text-sm">{zone.name}</span>
                                    <span className="px-2 py-1 bg-lime-500/20 text-lime-400 text-xs rounded-full font-bold">
                                      ${zone.basePrice}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-neutral-400">
                                    <Users className="w-3 h-3" />
                                    <span>{zone.capacity} seats</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 flex items-center justify-center gap-6">
                {/* <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-lime-500/20 border-2 border-lime-500/40"></div>
                  <span className="text-neutral-400 text-sm">Segment</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-neutral-800 border-2 border-neutral-700"></div>
                  <span className="text-neutral-400 text-sm">Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-neutral-800 border-2 border-lime-400"></div>
                  <span className="text-neutral-400 text-sm">Selected</span>
                </div> */}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-neutral-400">
            <MapPin size={64} className="mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Layout Configured</h3>
            <p className="text-sm">Configure segments and zones to visualize the venue layout</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VenueLayoutPreview;