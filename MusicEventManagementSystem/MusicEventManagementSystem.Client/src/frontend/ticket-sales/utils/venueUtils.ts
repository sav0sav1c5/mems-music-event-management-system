import { EventStatus } from '../../event-organization/types/enums/EventOrganization';
import { VenueType, SegmentType } from '../../ticket-sales/types/enums/TicketSales';

export const getStatusColor = (status: EventStatus) => {
  switch (status) {
    case EventStatus.Planned: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case EventStatus.InProgress: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case EventStatus.Completed: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    case EventStatus.Cancelled: return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export const getVenueTypeColor = (type: VenueType) => {
  switch (type) {
    case VenueType.Club: return 'bg-purple-500/20 text-purple-300';
    case VenueType.Arena: return 'bg-orange-500/20 text-orange-300';
    case VenueType.Outdoor: return 'bg-green-500/20 text-green-300';
    case VenueType.Indoor: return 'bg-blue-500/20 text-blue-300';
    case VenueType.Stadium: return 'bg-red-500/20 text-red-300';
    case VenueType.Theater: return 'bg-pink-500/20 text-pink-300';
    case VenueType.Festival: return 'bg-yellow-500/20 text-yellow-300';
    default: return 'bg-gray-500/20 text-gray-300';
  }
};

export const getVenueTypeName = (type: VenueType): string => {
  const typeMap = {
    [VenueType.Indoor]: 'Indoor',
    [VenueType.Outdoor]: 'Outdoor', 
    [VenueType.Stadium]: 'Stadium',
    [VenueType.Arena]: 'Arena',
    [VenueType.Theater]: 'Theater',
    [VenueType.Club]: 'Club',
    [VenueType.Festival]: 'Festival'
  };
  return typeMap[type] || 'Unknown';
};

export const getSegmentTypeName = (type: SegmentType): string => {
  const typeMap = {
    [SegmentType.VIP]: 'VIP',
    [SegmentType.Standard]: 'Standard',
    [SegmentType.Premium]: 'Premium',
    [SegmentType.Standing]: 'Standing',
    [SegmentType.Seated]: 'Seated'
  };
  return typeMap[type] || 'Unknown';
};

export const getEventStatusName = (status: EventStatus): string => {
  switch (status) {
    case EventStatus.Planned: return 'Planned';
    case EventStatus.InProgress: return 'In Progress';
    case EventStatus.Completed: return 'Completed';
    case EventStatus.Cancelled: return 'Cancelled';
    default: return 'Unknown';
  }
};

export const getSegmentTypeColor = (segmentType: number): string => {
  const colors = [
    'bg-blue-500/20',    // VIP
    'bg-green-500/20',   // Premium
    'bg-yellow-500/20',  // Standard
    'bg-purple-500/20',  // Balcony
    'bg-orange-500/20',  // Floor
    'bg-pink-500/20',    // Box
    'bg-indigo-500/20',  // Terrace
    'bg-red-500/20',     // Standing
  ];
  return colors[segmentType] || 'bg-gray-500/20';
};