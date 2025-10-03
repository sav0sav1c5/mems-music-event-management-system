import { useState, useEffect } from 'react';
import { ArrowLeft, Eye, Users } from 'lucide-react';
import { Card } from '../card';
import SegmentService from '../../services/segmentService';
import ZoneService from '../../services/zoneService';
import type { VenueResponse } from '../../types/api/venue';
import type { SegmentResponse } from '../../types/api/segment';
import type { ZoneResponse } from '../../types/api/zone';
import SegmentEditor from './SegmentEditor';
import ZoneEditor from './ZoneEditor';
import SegmentCreateForm from './SegmentCreateForm';
import ZoneCreateForm from './ZoneCreateForm';
import LayoutViewModal from './LayoutViewModal';
import { getVenueTypeName } from '../../utils/venueUtils';

interface VenueDetailViewProps {
  venue: VenueResponse;
  onBack: () => void;
}

const VenueDetailView = ({ venue, onBack }: VenueDetailViewProps) => {
  const [segments, setSegments] = useState<SegmentResponse[]>([]);
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLayoutView, setShowLayoutView] = useState(false);
  const [activeTab, setActiveTab] = useState('segments');

  useEffect(() => {
    loadVenueData();
  }, [venue]);

  const loadVenueData = async () => {
    try {
      setLoading(true);
      const [segmentsData, allZones] = await Promise.all([
        SegmentService.getSegmentsByVenueId(venue.venueId).catch(() => []),
        ZoneService.getAllZones().catch(() => [])
      ]);
      
      setSegments(segmentsData || []);
      
      // Filter zones for the current venue's segments
      const venueZones = allZones.filter(zone => 
        segmentsData.some(segment => segment.segmentId === zone.segmentId)
      );
      setZones(venueZones || []);
    } catch (error) {
      console.error('Error loading venue data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
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
              <h1 className="text-2xl font-bold text-white">{venue.name}</h1>
              <div className="flex items-center mt-1 text-neutral-400">
                <Users className="w-4 h-4 mr-2" />
                <span className="text-sm">Capacity: {(venue.capacity || 0).toLocaleString()}</span>
                <span className="mx-3">•</span>
                <span className="text-sm">{getVenueTypeName(venue.venueType)}</span>
                <span className="mx-3">•</span>
                <span className="text-sm">{venue.city}, {venue.address}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowLayoutView(true)}
              className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"
            >
              <Eye size={18} />
              View Layout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
        
        {/* Seat Plan Editor - Leva strana (2/3 širine) */}
        <div className="xl:col-span-2">
          <Card className="overflow-hidden h-full">
            <div className="mb-3 border-b border-neutral-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-white">Seat Plan Editor</h2>
                <div className="flex bg-neutral-800 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('segments')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'segments'
                        ? 'bg-lime-500 text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Segments
                  </button>
                  <button
                    onClick={() => setActiveTab('zones')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'zones'
                        ? 'bg-lime-500 text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Zones
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
              {activeTab === 'segments' ? 
                <SegmentEditor segments={segments} venueId={venue.venueId} onSegmentsUpdate={setSegments} /> : 
                <ZoneEditor zones={zones} segments={segments} onZonesUpdate={setZones} />
              }
            </div>
          </Card>
        </div>

        {/* Forms Panel - Desna strana (1/3 širine) */}
        <div className="xl:col-span-1">
          <Card className="overflow-hidden">
            <div className="mb-3 border-b border-neutral-800">
              <h2 className="text-xl font-semibold text-white mb-3">
                {activeTab === 'segments' ? 'Segment Configuration' : 'Zone Configuration'}
              </h2>
            </div>
            
            <div className="">
              {activeTab === 'segments' ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Create New Segment</h3>
                  <SegmentCreateForm 
                    venueId={venue.venueId}
                    segments={segments}
                    onSegmentCreated={(newSegment) => {
                      setSegments(prev => [...prev, newSegment]);
                    }}
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Create New Zone</h3>
                  <ZoneCreateForm 
                    segments={segments}
                    onZoneCreated={(newZone) => {
                      setZones(prev => [...prev, newZone]);
                    }}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* View Layout Modal */}
      {showLayoutView && (
        <LayoutViewModal 
          venue={venue}
          segments={segments}
          zones={zones}
          onClose={() => setShowLayoutView(false)}
        />
      )}
    </div>
  );
};

export default VenueDetailView;