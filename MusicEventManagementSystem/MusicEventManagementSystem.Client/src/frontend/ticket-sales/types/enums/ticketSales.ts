// Ticket Sales Enumerations

export const VenueType = {
  Indoor: 0,
  Outdoor: 1,
  Stadium: 2,
  Arena: 3,
  Theater: 4,
  Club: 5,
  Festival: 6
} as const;

export const SegmentType = {
  VIP: 0,
  Standard: 1,
  Premium: 2,
  Standing: 3,
  Seated: 4
} as const;

export const ZonePosition = {
  Front: 0,
  Center: 1,
  Back: 2,
  Left: 3,
  Right: 4,
  Upper: 5,
  Lower: 6,
  Balcony: 7
} as const;

export const OfferType = {
  EarlyBird: 0,
  StudentDiscount: 1,
  GroupDiscount: 2,
  SeniorDiscount: 3,
  LoyaltyDiscount: 4,
  SeasonPass: 5,
  BuyOneGetOne: 6,
  PercentageOff: 7,
  FixedAmountOff: 8
} as const;

export const TicketTypeStatus = {
  Active: 0,
  Inactive: 1,
  SoldOut: 2,
  ComingSoon: 3,
  Suspended: 4
} as const;

export const TicketStatus = {
  Available: 0,
  Reserved: 1,
  Sold: 2,
  Used: 3,
  Cancelled: 4,
  Expired: 5,
  Refunded: 6
} as const;

export const PricingCondition = {
  TimeBasedEarlyBird: 0,
  OccupancyBased: 1,
  DateProximity: 2,
  WeatherDependent: 3,
  DayOfWeek: 4,
  SeasonalDiscount: 5,
  VIPUpgrade: 6,
  LastMinute: 7
} as const;

export const PaymentMethod = {
  CreditCard: 0,
  DebitCard: 1,
  Cash: 2,
  BankTransfer: 3,
  PayPal: 4,
  ApplePay: 5,
  GooglePay: 6,
  Cryptocurrency: 7
} as const;

export const TransactionStatus = {
  Pending: 0,
  Completed: 1,
  Failed: 2,
  Cancelled: 3,
  Refunded: 4,
  PartiallyRefunded: 5,
  Processing: 6
} as const;

// Type definitions for better type safety
export type OfferType = typeof OfferType[keyof typeof OfferType];
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];
export type PricingCondition = typeof PricingCondition[keyof typeof PricingCondition];
export type SegmentType = typeof SegmentType[keyof typeof SegmentType];
export type TicketStatus = typeof TicketStatus[keyof typeof TicketStatus];
export type TicketTypeStatus = typeof TicketTypeStatus[keyof typeof TicketTypeStatus];
export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];
export type VenueType = typeof VenueType[keyof typeof VenueType];
export type ZonePosition = typeof ZonePosition[keyof typeof ZonePosition];