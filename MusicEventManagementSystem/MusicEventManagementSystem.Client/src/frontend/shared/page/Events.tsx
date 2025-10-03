import { useState, useEffect } from "react";
import { Search, Filter, Calendar, MapPin, Ticket, X, Clock, Users, Tag } from "lucide-react";
import { EventService } from "../../event-organization/services/eventService";
import type { EventResponse } from "../../event-organization/types/api/event";
import { Card } from "../../ticket-sales/components/card";
import { TicketTypeService } from "../../ticket-sales/services/ticketTypeService";
import type { TicketTypeResponse } from "../../ticket-sales/types/api/ticketType";
import { ZoneService } from "../../ticket-sales/services/zoneService";
import type { ZoneResponse } from "../../ticket-sales/types/api/zone";
import { PricingRuleService, type CalculatePriceRequest } from "../../ticket-sales/services/pricingRuleService";
import { SpecialOfferService } from "../../ticket-sales/services/specialOfferService";
import type { SpecialOfferResponse } from "../../ticket-sales/types/api/specialOffer";
import { VenueService } from "../../ticket-sales/services/venueService";
import type { VenueResponse } from "../../ticket-sales/types/api/venue";

// Import enumerations
import { 
  TicketTypeStatus, 
  TicketStatus, 
  TransactionStatus, 
  OfferType,
  PricingCondition,
  PaymentMethod,
  SegmentType,
  VenueType,
  ZonePosition
} from "../../ticket-sales/types/enums/TicketSales";

interface TicketTypeWithPrice extends TicketTypeResponse {
  calculatedPrice?: number;
  zone?: ZoneResponse;
  applicableOffers?: SpecialOfferResponse[];
}

// Helper functions to convert enum values to readable strings
const getEventStatusText = (status: number): string => {
  switch (status) {
    case 0: return 'Planned';
    case 1: return 'InProgress';
    case 2: return 'Completed';
    case 3: return 'Cancelled';
    default: return 'Unknown';
  }
};

const getTicketTypeStatusText = (status: number): string => {
  switch (status) {
    case TicketTypeStatus.Active: return 'Active';
    case TicketTypeStatus.Inactive: return 'Inactive';
    case TicketTypeStatus.SoldOut: return 'Sold Out';
    case TicketTypeStatus.ComingSoon: return 'Coming Soon';
    case TicketTypeStatus.Suspended: return 'Suspended';
    default: return 'Unknown';
  }
};

const getTicketStatusText = (status: number): string => {
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

const getOfferTypeText = (offerType: number): string => {
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

const Events = () => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [eventTicketTypes, setEventTicketTypes] = useState<TicketTypeWithPrice[]>([]);
  const [specialOffers, setSpecialOffers] = useState<SpecialOfferResponse[]>([]);
  const [venues, setVenues] = useState<VenueResponse[]>([]);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [selectedSpecialOffers, setSelectedSpecialOffers] = useState<{[ticketTypeId: number]: number}>({});

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await EventService.getAllEvents();
      
      const processedEvents = eventsData.map(event => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
      }));
      
      setEvents(processedEvents);

      // Fetch venues for location data
      try {
        const venuesData = await VenueService.getAllVenues();
        setVenues(venuesData);
      } catch (error) {
        console.error("Error fetching venues:", error);
      }

    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get venue address for an event
  const getEventLocation = (event: EventResponse): string => {
    // If event has a specific locationId, try to find matching venue
    if (event.locationId && venues.length > 0) {
      const venue = venues.find(v => v.venueId === event.locationId);
      if (venue) {
        return `${venue.name}, ${venue.address}, ${venue.city}`;
      }
    }
    
    // Fallback: use first venue or generic location
    if (venues.length > 0) {
      const firstVenue = venues[0];
      return `${firstVenue.name}, ${firstVenue.address}, ${firstVenue.city}`;
    }
    
    return event.locationId?.toString() || "Location to be announced";
  };

  const calculateTicketPrice = async (basePrice: number, ticketTypeId: number): Promise<number> => {
    try {
      let finalPrice = basePrice;

      // Apply pricing rules if available
      const pricingRules = await PricingRuleService.getPricingRulesByTicketType(ticketTypeId);
      
      if (pricingRules.length > 0) {
        const activeRule = pricingRules[0];
        
        const priceRequest: CalculatePriceRequest = {
          basePrice: basePrice,
          occupancyRate: 0.5,
          isEarlyBird: false
        };

        try {
          const calculatedPrice = await PricingRuleService.calculatePrice(
            activeRule.pricingRuleId, 
            priceRequest
          );
          finalPrice = calculatedPrice;
        } catch (error) {
          console.warn('Error calculating price with rule, using base price');
        }
      }

      // Apply special offer if selected
      const selectedOfferId = selectedSpecialOffers[ticketTypeId];
      if (selectedOfferId) {
        const offer = specialOffers.find(o => o.specialOfferId === selectedOfferId);
        if (offer) {
          finalPrice = finalPrice * (1 - offer.discountValue / 100);
        }
      }

      return Math.max(Math.round(finalPrice * 100) / 100, 0);
    } catch (error) {
      console.error('Error calculating ticket price:', error);
      return basePrice;
    }
  };

  const fetchEventData = async (eventId: number) => {
    try {
      setTicketLoading(true);
      
      // Fetch ticket types for event
      const ticketTypes = await TicketTypeService.getByEventId(eventId);

      // Fetch zones and calculate prices
      const ticketTypesWithPrices: TicketTypeWithPrice[] = [];
      
      for (const ticketType of ticketTypes) {
        try {
          const zone = await ZoneService.getZoneById(ticketType.zoneId);
          const basePrice = zone?.basePrice || 0;
          const calculatedPrice = await calculateTicketPrice(basePrice, ticketType.ticketTypeId);
          
          ticketTypesWithPrices.push({
            ...ticketType,
            calculatedPrice,
            zone
          });
        } catch (error) {
          console.error(`Error processing ticket type ${ticketType.ticketTypeId}:`, error);
          ticketTypesWithPrices.push({
            ...ticketType,
            calculatedPrice: 0,
            zone: undefined
          });
        }
      }

      setEventTicketTypes(ticketTypesWithPrices);

      // Fetch active special offers
      const activeOffers = await SpecialOfferService.getActiveOffers();
      setSpecialOffers(activeOffers);

    } catch (error) {
      console.error("Error fetching event data:", error);
      setEventTicketTypes([]);
      setSpecialOffers([]);
    } finally {
      setTicketLoading(false);
    }
  };

  const handleViewDetails = async (event: EventResponse) => {
    setSelectedEvent(event);
    await fetchEventData(event.id);
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
    setEventTicketTypes([]);
    setSpecialOffers([]);
    setSelectedSpecialOffers({});
  };

  const handleSpecialOfferSelect = async (ticketTypeId: number, offerId: number) => {
    const newSelectedOffers = {
      ...selectedSpecialOffers,
      [ticketTypeId]: offerId
    };
    setSelectedSpecialOffers(newSelectedOffers);

    // Recalculate price for this ticket type
    const ticketType = eventTicketTypes.find(tt => tt.ticketTypeId === ticketTypeId);
    if (ticketType && ticketType.zone) {
      const basePrice = ticketType.zone.basePrice;
      const newPrice = await calculateTicketPrice(basePrice, ticketTypeId);
      
      setEventTicketTypes(prev => prev.map(tt => 
        tt.ticketTypeId === ticketTypeId 
          ? { ...tt, calculatedPrice: newPrice }
          : tt
      ));
    }
  };

  const getApplicableOffers = (ticketType: TicketTypeResponse): SpecialOfferResponse[] => {
    return specialOffers.filter(offer => 
      offer.applicableTicketTypeIds?.includes(ticketType.ticketTypeId)
    );
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('sr-RS', {
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

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
      <div className="text-white h-full flex flex-col p-4 m-1">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Browse Events</h1>
              <p className="text-neutral-400 text-sm">Discover amazing events near you</p>
            </div>
            <button className="px-6 py-3 rounded-xl bg-orange-400 text-black font-medium hover:bg-orange-500 transition-all duration-200 shadow-lg flex items-center gap-2">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center text-neutral-400 py-8 text-base">
              Loading events...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="col-span-full text-center text-neutral-400 py-8 text-base">
              No events found
            </div>
          ) : (
            filteredEvents.map((event) => (
              <Card key={event.id} hover={true} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-400/20 rounded-xl">
                      <Ticket className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-lg">{event.name}</h3>
                      <p className="text-neutral-400 text-sm">{getEventStatusText(event.status)}</p>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <p className="text-neutral-400 text-base mb-4 line-clamp-2">{event.description}</p>
                )}

                <div className="flex space-x-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <span className="text-neutral-300 text-sm">{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    <span className="text-neutral-300 text-sm">{getEventLocation(event)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                  <div className="text-orange-400 font-medium text-lg">
                    From {formatCurrency(20)}
                  </div>
                  <button 
                    onClick={() => handleViewDetails(event)}
                    className="px-4 py-2 rounded-xl bg-orange-400 text-black font-medium hover:bg-orange-500 transition-all duration-200 shadow-lg text-sm"
                  >
                    View Details
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                <h2 className="text-2xl font-bold text-white">{selectedEvent.name}</h2>
                <button
                  onClick={handleCloseDetails}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-neutral-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Event Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Event Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-neutral-400 text-sm">Date</p>
                          <p className="text-white">{formatDate(selectedEvent.startDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-neutral-400 text-sm">Time</p>
                          <p className="text-white">
                            {formatTime(selectedEvent.startDate)} - {formatTime(selectedEvent.endDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-neutral-400 text-sm">Location</p>
                          <p className="text-white">{getEventLocation(selectedEvent)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Ticket className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-neutral-400 text-sm">Status</p>
                          <p className="text-white capitalize">{getEventStatusText(selectedEvent.status)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
                    <p className="text-neutral-300 leading-relaxed">
                      {selectedEvent.description || "No description available for this event."}
                    </p>
                  </div>
                </div>

                {/* Ticket Types */}
                <div className="border-t border-neutral-800 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Available Tickets</h3>
                  
                  {ticketLoading ? (
                    <div className="text-center text-neutral-400 py-4">
                      Loading tickets...
                    </div>
                  ) : eventTicketTypes.length === 0 ? (
                    <div className="text-center text-neutral-400 py-4">
                      No tickets available for this event yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {eventTicketTypes.map((ticketType) => {
                        const applicableOffers = getApplicableOffers(ticketType);
                        const selectedOfferId = selectedSpecialOffers[ticketType.ticketTypeId];
                        const selectedOffer = applicableOffers.find(o => o.specialOfferId === selectedOfferId);

                        return (
                          <Card key={ticketType.ticketTypeId} className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="text-white font-medium">{ticketType.name}</h4>
                                <p className="text-neutral-400 text-sm">
                                  {getTicketTypeStatusText(ticketType.status)}
                                </p>
                                {ticketType.zone && (
                                  <p className="text-neutral-400 text-sm">Zone: {ticketType.zone.name}</p>
                                )}
                                {ticketType.description && (
                                  <p className="text-neutral-400 text-sm mt-1">{ticketType.description}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-orange-400 font-bold text-lg">
                                  {formatCurrency(ticketType.calculatedPrice || 0)}
                                </div>
                                {selectedOffer && (
                                  <div className="text-green-400 text-sm flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    {getOfferTypeText(selectedOffer.offerType)} - {selectedOffer.discountValue}% off
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm mb-3">
                              <div className="flex items-center gap-1 text-neutral-400">
                                <Users className="w-4 h-4" />
                                <span>{ticketType.availableQuantity} available</span>
                              </div>
                            </div>

                            {/* Special Offers Dropdown */}
                            {applicableOffers.length > 0 && (
                              <div className="mb-3">
                                <label className="text-neutral-400 text-sm mb-1 block">
                                  Apply Special Offer:
                                </label>
                                <select 
                                  value={selectedOfferId || ''}
                                  onChange={(e) => handleSpecialOfferSelect(
                                    ticketType.ticketTypeId, 
                                    parseInt(e.target.value)
                                  )}
                                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm"
                                >
                                  <option value="">No offer</option>
                                  {applicableOffers.map(offer => (
                                    <option key={offer.specialOfferId} value={offer.specialOfferId}>
                                      {getOfferTypeText(offer.offerType)} - {offer.discountValue}% off
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            <button className="w-full py-2 bg-orange-400 text-black font-medium rounded-lg hover:bg-orange-500 transition-colors">
                              Add to Cart
                            </button>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-800">
                  <button
                    onClick={handleCloseDetails}
                    className="flex-1 py-3 px-4 border border-neutral-700 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    Close
                  </button>
                  <button className="flex-1 py-3 px-4 bg-orange-400 text-black font-medium rounded-lg hover:bg-orange-500 transition-colors">
                    View Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;