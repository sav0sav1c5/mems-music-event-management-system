import { 
  VenueType, 
  SegmentType, 
  ZonePosition, 
  OfferType, 
  TicketTypeStatus, 
  TicketStatus, 
  PaymentMethod, 
  TransactionStatus
} from '../../ticket-sales/types/enums/ticketSales';

import { EventStatus } from '../../event-organization/types/enums/EventOrganization';


// Venue Type utilities
export const getVenueTypeName = (venueType: VenueType): string => {
  switch (venueType) {
    case VenueType.Indoor: return 'Indoor';
    case VenueType.Outdoor: return 'Outdoor';
    case VenueType.Stadium: return 'Stadium';
    case VenueType.Arena: return 'Arena';
    case VenueType.Theater: return 'Theater';
    case VenueType.Club: return 'Club';
    case VenueType.Festival: return 'Festival';
    default: return 'Unknown';
  }
};

// Segment Type utilities
export const getSegmentTypeName = (segmentType: SegmentType): string => {
  switch (segmentType) {
    case SegmentType.VIP: return 'VIP';
    case SegmentType.Standard: return 'Standard';
    case SegmentType.Premium: return 'Premium';
    case SegmentType.Standing: return 'Standing';
    case SegmentType.Seated: return 'Seated';
    default: return 'Unknown';
  }
};

// Zone Position utilities
export const getZonePositionName = (position: ZonePosition): string => {
  switch (position) {
    case ZonePosition.Front: return 'Front';
    case ZonePosition.Back: return 'Back';
    case ZonePosition.Upper: return 'Upper';
    case ZonePosition.Lower: return 'Lower';
    case ZonePosition.Balcony: return 'Balcony';
    case ZonePosition.Center: return 'Center';
    case ZonePosition.Left: return 'Left';
    case ZonePosition.Right: return 'Right';
    default: return 'Unknown';
  }
};

// Payment Method utilities
export const getPaymentMethodName = (paymentMethod: PaymentMethod): string => {
  switch (paymentMethod) {
    case PaymentMethod.CreditCard: return 'Credit Card';
    case PaymentMethod.DebitCard: return 'Debit Card';
    case PaymentMethod.Cash: return 'Cash';
    case PaymentMethod.BankTransfer: return 'Bank Transfer';
    case PaymentMethod.PayPal: return 'PayPal';
    case PaymentMethod.ApplePay: return 'Apple Pay';
    case PaymentMethod.GooglePay: return 'Google Pay';
    case PaymentMethod.Cryptocurrency: return 'Cryptocurrency';
    default: return 'Unknown';
  }
};

// Transaction Status utilities
export const getTransactionStatusName = (status: TransactionStatus): string => {
  switch (status) {
    case TransactionStatus.Pending: return 'Pending';
    case TransactionStatus.Completed: return 'Completed';
    case TransactionStatus.Failed: return 'Failed';
    case TransactionStatus.Cancelled: return 'Cancelled';
    case TransactionStatus.Refunded: return 'Refunded';
    case TransactionStatus.PartiallyRefunded: return 'Partially Refunded';
    case TransactionStatus.Processing: return 'Processing';
    default: return 'Unknown';
  }
};

// Ticket Status utilities
export const getTicketStatusName = (status: TicketStatus): string => {
  switch (status) {
    case TicketStatus.Available: return 'Available';
    case TicketStatus.Reserved: return 'Reserved';
    case TicketStatus.Sold: return 'Sold';
    case TicketStatus.Used: return 'Used';
    case TicketStatus.Cancelled: return 'Cancelled';
    case TicketStatus.Expired: return 'Expired';
    case TicketStatus.Refunded: return 'Refunded';
    default: return 'Unknown';
  }
};

// Ticket Type Status utilities
export const getTicketTypeStatusName = (status: TicketTypeStatus): string => {
  switch (status) {
    case TicketTypeStatus.Active: return 'Active';
    case TicketTypeStatus.Inactive: return 'Inactive';
    case TicketTypeStatus.SoldOut: return 'Sold Out';
    case TicketTypeStatus.ComingSoon: return 'Coming Soon';
    case TicketTypeStatus.Suspended: return 'Suspended';
    default: return 'Unknown';
  }
};

// Offer Type utilities
export const getOfferTypeName = (offerType: OfferType): string => {
  switch (offerType) {
    case OfferType.EarlyBird: return 'Early Bird';
    case OfferType.StudentDiscount: return 'Student Discount';
    case OfferType.GroupDiscount: return 'Group Discount';
    case OfferType.SeniorDiscount: return 'Senior Discount';
    case OfferType.LoyaltyDiscount: return 'Loyalty Discount';
    case OfferType.SeasonPass: return 'Season Pass';
    case OfferType.BuyOneGetOne: return 'Buy One Get One';
    case OfferType.PercentageOff: return 'Percentage Off';
    case OfferType.FixedAmountOff: return 'Fixed Amount Off';
    default: return 'Unknown';
  }
};

// Event Status utilities
const getEventStatusName = (status: EventStatus): string => {
  switch (status) {
    case EventStatus.Planned: return 'Planned';
    case EventStatus.InProgress: return 'In Progress';
    case EventStatus.Completed: return 'Completed';
    case EventStatus.Cancelled: return 'Cancelled';
    default: return 'Unknown';
  }
};

// Status color utilities
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'sold':
    case 'available':
      return 'bg-green-400/20 text-green-400';
    case 'pending':
    case 'reserved':
    case 'processing':
      return 'bg-yellow-400/20 text-yellow-400';
    case 'inactive':
    case 'failed':
    case 'cancelled':
    case 'expired':
      return 'bg-red-400/20 text-red-400';
    case 'maintenance':
    case 'suspended':
      return 'bg-orange-400/20 text-orange-400';
    default:
      return 'bg-neutral-400/20 text-neutral-400';
  }
};