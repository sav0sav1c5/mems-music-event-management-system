import { useState, useEffect } from "react";
import { Search, Calendar, MapPin, Ticket, X, Clock, Users, Tag, ShoppingCart } from "lucide-react";
import { EventsService } from "../../shared/services/client/eventsService";
import { CartService } from "../../shared/services/client/cartService";
import type { ClientEventDto, EventDetailsDto } from "../../shared/types/api/event";
import type { AddToCartDto } from "../../shared/types/api/cart";
import { Card } from "../../ticket-sales/components/ui/card";

const Events = () => {
  const [events, setEvents] = useState<ClientEventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventDetailsDto | null>(null);
  const [eventLoading, setEventLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [searchFilters, setSearchFilters] = useState({
    keyword: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined
  });

  // Mock user ID - replace with actual user ID from auth context
  const userId = "user123";

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await EventsService.getUpcomingEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await EventsService.searchEvents(
        searchFilters.keyword,
        searchFilters.startDate,
        searchFilters.endDate
      );
      setEvents(eventsData);
    } catch (error) {
      console.error("Error searching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventDetails = async (eventId: number) => {
    try {
      setEventLoading(true);
      const eventDetails = await EventsService.getEventDetails(eventId);
      setSelectedEvent(eventDetails);
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setEventLoading(false);
    }
  };

  const handleAddToCart = async (ticketTypeId: number) => {
    try {
      setAddingToCart(ticketTypeId);
      const addToCartDto: AddToCartDto = {
        ticketTypeId,
        quantity: 1
      };
      await CartService.addToCart(userId, addToCartDto);
      // Show success message or update UI
      alert("Ticket added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add ticket to cart. Please try again.");
    } finally {
      setAddingToCart(null);
    }
  };

  const handleViewDetails = async (event: ClientEventDto) => {
    await fetchEventDetails(event.id);
  };

  const handleCloseDetails = () => {
    setSelectedEvent(null);
  };

  const handleSearch = () => {
    if (searchFilters.keyword || searchFilters.startDate || searchFilters.endDate) {
      searchEvents();
    } else {
      fetchEvents();
    }
  };

  const handleClearFilters = () => {
    setSearchFilters({
      keyword: "",
      startDate: undefined,
      endDate: undefined
    });
    fetchEvents();
  };

  const getEventLocation = (event: ClientEventDto): string => {
    if (event.venueNames && event.venueNames.length > 0) {
      return event.venueNames.join(", ");
    }
    return "Location to be announced";
  };

  const getPerformersText = (event: ClientEventDto): string => {
    if (event.performerNames && event.performerNames.length > 0) {
      return event.performerNames.join(", ");
    }
    return "Performers to be announced";
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('sr-RS', {
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

  const getPriceRange = (event: ClientEventDto): string => {
    if (event.minPrice === 0 && event.maxPrice === 0) {
      return "Free";
    }
    if (event.minPrice === event.maxPrice) {
      return formatCurrency(event.minPrice);
    }
    return `${formatCurrency(event.minPrice)} - ${formatCurrency(event.maxPrice)}`;
  };

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
      <div className="text-white h-full flex flex-col p-4 m-1">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Browse Events</h1>
              <p className="text-neutral-400 text-sm">Discover amazing events near you</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search events, performers, venues..."
                value={searchFilters.keyword}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, keyword: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Date Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={searchFilters.startDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setSearchFilters(prev => ({ 
                  ...prev, 
                  startDate: e.target.value ? new Date(e.target.value) : undefined 
                }))}
                className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
              <input
                type="date"
                value={searchFilters.endDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => setSearchFilters(prev => ({ 
                  ...prev, 
                  endDate: e.target.value ? new Date(e.target.value) : undefined 
                }))}
                className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="px-6 py-3 rounded-xl bg-orange-400 text-black font-medium hover:bg-orange-500 transition-all duration-200 shadow-lg flex items-center gap-2"
              >
                <Search size={16} />
                Search
              </button>
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 rounded-xl bg-neutral-700 text-white font-medium hover:bg-neutral-600 transition-all duration-200 flex items-center gap-2"
              >
                <X size={16} />
                Clear
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => EventsService.getFeaturedEvents().then(setEvents)}
              className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors text-sm"
            >
              Featured
            </button>
            <button
              onClick={() => EventsService.getEventsByCity("Belgrade").then(setEvents)}
              className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors text-sm"
            >
              Belgrade
            </button>
            <button
              onClick={() => EventsService.getEventsByCity("Novi Sad").then(setEvents)}
              className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors text-sm"
            >
              Novi Sad
            </button>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto">
          {loading ? (
            <div className="col-span-full text-center text-neutral-400 py-8 text-base">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="col-span-full text-center text-neutral-400 py-8 text-base">
              No events found matching your criteria
            </div>
          ) : (
            events.map((event) => (
              <Card key={event.id} hover={true} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-400/20 rounded-xl">
                      <Ticket className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-lg">{event.name}</h3>
                      <p className="text-neutral-400 text-sm capitalize">{event.status?.toLowerCase()}</p>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <p className="text-neutral-400 text-base mb-4 line-clamp-2">{event.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <span className="text-neutral-300 text-sm">
                      {formatDate(event.startDate)} at {formatTime(event.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    <span className="text-neutral-300 text-sm">{getEventLocation(event)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-400" />
                    <span className="text-neutral-300 text-sm">{getPerformersText(event)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                  <div className="text-orange-400 font-medium text-lg">
                    {getPriceRange(event)}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-400 text-sm">
                    <Ticket className="w-4 h-4" />
                    {event.availableTickets} available
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => handleViewDetails(event)}
                    className="flex-1 px-4 py-2 rounded-xl bg-orange-400 text-black font-medium hover:bg-orange-500 transition-all duration-200 shadow-lg text-sm"
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
              <div className="flex items-center justify-between p-6 border-b border-neutral-800 sticky top-0 bg-neutral-900 z-10">
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
                {eventLoading ? (
                  <div className="text-center text-neutral-400 py-8">
                    Loading event details...
                  </div>
                ) : (
                  <>
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
                            <Ticket className="w-5 h-5 text-orange-400" />
                            <div>
                              <p className="text-neutral-400 text-sm">Status</p>
                              <p className="text-white capitalize">{selectedEvent.status?.toLowerCase()}</p>
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

                    {/* Venues */}
                    {selectedEvent.venues && selectedEvent.venues.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Venues</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedEvent.venues.map((venue) => (
                            <Card key={venue.venueId} className="p-4">
                              <h4 className="text-white font-medium mb-2">{venue.name}</h4>
                              <div className="space-y-1 text-sm text-neutral-400">
                                <p>{venue.address}, {venue.city}</p>
                                <p>Capacity: {venue.capacity.toLocaleString()}</p>
                                <p>Type: {venue.venueType}</p>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Performers */}
                    {selectedEvent.performers && selectedEvent.performers.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Performers</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedEvent.performers.map((performer) => (
                            <Card key={performer.performerId} className="p-4">
                              <h4 className="text-white font-medium mb-2">{performer.name}</h4>
                              <div className="space-y-1 text-sm text-neutral-400">
                                <p>Genre: {performer.genre}</p>
                                {performer.performanceStartTime && (
                                  <p>
                                    Performance: {formatTime(performer.performanceStartTime)}
                                    {performer.performanceEndTime && ` - ${formatTime(performer.performanceEndTime)}`}
                                  </p>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ticket Zones */}
                    {selectedEvent.ticketZones && selectedEvent.ticketZones.length > 0 && (
                      <div className="border-t border-neutral-800 pt-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Available Tickets</h3>
                        <div className="space-y-4">
                          {selectedEvent.ticketZones.map((zone) => (
                            <div key={zone.zoneId} className="border border-neutral-800 rounded-lg p-4">
                              <h4 className="text-white font-medium mb-3">{zone.zoneName}</h4>
                              {zone.zoneDescription && (
                                <p className="text-neutral-400 text-sm mb-3">{zone.zoneDescription}</p>
                              )}
                              <div className="space-y-3">
                                {zone.ticketTypes?.map((ticketType) => (
                                  <Card key={ticketType.ticketTypeId} className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                      <div>
                                        <h5 className="text-white font-medium">{ticketType.name}</h5>
                                        {ticketType.description && (
                                          <p className="text-neutral-400 text-sm mt-1">{ticketType.description}</p>
                                        )}
                                        <div className="flex items-center gap-1 text-neutral-400 text-sm mt-1">
                                          <Users className="w-4 h-4" />
                                          <span>{ticketType.availableQuantity} available</span>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-orange-400 font-bold text-lg">
                                          {formatCurrency(ticketType.currentPrice)}
                                        </div>
                                        {ticketType.basePrice !== ticketType.currentPrice && (
                                          <div className="text-neutral-400 text-sm line-through">
                                            {formatCurrency(ticketType.basePrice)}
                                          </div>
                                        )}
                                        {ticketType.hasSpecialOffer && (
                                          <div className="text-green-400 text-sm flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            Special Offer
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => handleAddToCart(ticketType.ticketTypeId)}
                                      disabled={addingToCart === ticketType.ticketTypeId || ticketType.availableQuantity === 0}
                                      className="w-full py-2 bg-orange-400 text-black font-medium rounded-lg hover:bg-orange-500 transition-colors disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                      {addingToCart === ticketType.ticketTypeId ? (
                                        "Adding..."
                                      ) : ticketType.availableQuantity === 0 ? (
                                        "Sold Out"
                                      ) : (
                                        <>
                                          <ShoppingCart size={16} />
                                          Add to Cart
                                        </>
                                      )}
                                    </button>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6 pt-6 border-t border-neutral-800">
                      <button
                        onClick={handleCloseDetails}
                        className="flex-1 py-3 px-4 border border-neutral-700 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;