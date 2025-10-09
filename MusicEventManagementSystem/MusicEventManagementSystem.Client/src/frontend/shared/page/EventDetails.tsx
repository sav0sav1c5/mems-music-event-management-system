import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Ticket, MapPin, Users, Tag, ShoppingCart, Loader2 } from "lucide-react";
import { EventsService } from "../services/client/eventsService";
import { CartService } from "../services/client/cartService";
import { useAuth } from "../contexts/AuthContext";
import { Card } from "../../ticket-sales/components/ui/card";
import { toast } from "react-toastify";
import type { EventDetailsDto } from "../types/api/event";

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<EventDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEventDetails(parseInt(id));
    }
  }, [id]);

  const fetchEventDetails = async (eventId: number) => {
    try {
      setLoading(true);
      setError(null);
      const eventDetails = await EventsService.getEventDetails(eventId);
      setEvent(eventDetails);
    } catch (err: any) {
      console.error("Error fetching event details:", err);
      setError(err.message || "Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (ticketTypeId: number) => {
    if (!isAuthenticated || !userId) {
      alert("Please log in to add tickets to cart");
      return;
    }
    
    try {
      setAddingToCart(ticketTypeId);
      await CartService.addToCart(userId, {
        ticketTypeId,
        quantity: 1
      });
      toast.success("Ticket added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add ticket to cart. Please try again.");
    } finally {
      setAddingToCart(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'soldout': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  if (loading) {
    return (
      <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
        <div className="text-white h-full flex flex-col p-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/client/events")}
              className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-orange-400"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <div className="h-8 bg-neutral-800 rounded-xl animate-pulse w-64"></div>
              <div className="h-4 bg-neutral-800 rounded mt-2 animate-pulse w-32"></div>
            </div>
          </div>
          <div className="flex items-center justify-center flex-1">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
              <p className="text-neutral-400 text-base">Loading event details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
        <div className="text-white h-full flex flex-col p-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/client/events")}
              className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-orange-400"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Event Details</h1>
            </div>
          </div>
          <Card className="text-center py-16">
            <div className="p-4 bg-red-500/20 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-red-500/30">
              <Ticket className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-neutral-400 text-base mb-2">{error || "Event not found"}</p>
            <button 
              onClick={() => navigate("/client/events")}
              className="px-6 py-3 rounded-xl bg-orange-400 text-black font-medium hover:bg-orange-500 transition-all duration-200 shadow-lg mt-4"
            >
              Back to Events
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
      <div className="text-white h-full flex flex-col p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <button
            onClick={() => navigate("/client/events")}
            className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-orange-400 flex-shrink-0 mt-1"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-orange-400 mb-1">Event Details:</h2>
                <h1 className="text-2xl font-bold text-white">{event.name}</h1>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-3 justify-end">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(event.status || '')}`}>
                    {event.status?.toLowerCase() || 'unknown'}
                  </span>
                </div>
                <span className="text-neutral-400 text-sm mt-2 block">
                  {formatDate(event.startDate)} • {formatTime(event.startDate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Event Description */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">About This Event</h2>
                <p className="text-neutral-300 leading-relaxed text-base">
                  {event.description || "No description available for this event."}
                </p>
              </Card>

              {/* Event Details */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Event Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <div>
                        <p className="text-neutral-400 text-sm">Date</p>
                        <p className="text-white font-medium">{formatDate(event.startDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <div>
                        <p className="text-neutral-400 text-sm">Time</p>
                        <p className="text-white font-medium">
                          {formatTime(event.startDate)} - {formatTime(event.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Ticket className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <div>
                        <p className="text-neutral-400 text-sm">Status</p>
                        <p className="text-white font-medium capitalize">{event.status?.toLowerCase()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Ticket Selection */}
              {event.ticketZones && event.ticketZones.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">Available Tickets</h2>
                  <div className="space-y-6">
                    {event.ticketZones.map((zone) => (
                      <Card key={zone.zoneId} className="p-6 border border-neutral-700">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-white font-semibold text-lg mb-2">{zone.zoneName}</h3>
                            {zone.zoneDescription && (
                              <p className="text-neutral-400 text-sm">{zone.zoneDescription}</p>
                            )}
                          </div>
                          {zone.position && (
                            <span className="px-3 py-1 bg-neutral-800 text-neutral-400 text-sm rounded-full border border-neutral-700">
                              {zone.position}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          {zone.ticketTypes?.map((ticketType) => (
                            <Card key={ticketType.ticketTypeId} className="p-4 bg-neutral-800/50 border border-neutral-600">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h4 className="text-white font-medium text-base mb-2">{ticketType.name}</h4>
                                  {ticketType.description && (
                                    <p className="text-neutral-400 text-sm mb-3">{ticketType.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-2 text-neutral-400">
                                      <Users className="w-4 h-4" />
                                      <span>{ticketType.availableQuantity} available</span>
                                    </div>
                                    {ticketType.hasSpecialOffer && (
                                      <div className="flex items-center gap-2 text-green-400">
                                        <Tag className="w-4 h-4" />
                                        <span>Special Offer Available</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <div className="text-orange-400 font-bold text-lg mb-1">
                                    {formatCurrency(ticketType.currentPrice)}
                                  </div>
                                  {ticketType.basePrice !== ticketType.currentPrice && (
                                    <div className="text-neutral-400 text-sm line-through mb-1">
                                      {formatCurrency(ticketType.basePrice)}
                                    </div>
                                  )}
                                  {ticketType.discountPercentage && (
                                    <div className="text-green-400 text-sm font-medium">
                                      Save {ticketType.discountPercentage}%
                                    </div>
                                  )}
                                </div>
                              </div>
                              <button 
                                onClick={() => handleAddToCart(ticketType.ticketTypeId)}
                                disabled={addingToCart === ticketType.ticketTypeId || ticketType.availableQuantity === 0}
                                className="w-full py-3 bg-orange-400 text-black font-semibold rounded-xl hover:bg-orange-500 transition-all duration-200 disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg text-base"
                              >
                                {addingToCart === ticketType.ticketTypeId ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : ticketType.availableQuantity === 0 ? (
                                  "Sold Out"
                                ) : (
                                  <>
                                    <ShoppingCart size={18} />
                                    Add to Cart
                                  </>
                                )}
                              </button>
                            </Card>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Venues */}
              {event.venues && event.venues.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-400" />
                    Venue Information
                  </h3>
                  <div className="space-y-4">
                    {event.venues.map((venue) => (
                      <div key={venue.venueId} className="space-y-2">
                        <h4 className="text-white font-medium">{venue.name}</h4>
                        <div className="text-sm text-neutral-400 space-y-1">
                          <p>{venue.address}</p>
                          <p>{venue.city}</p>
                          <p>Capacity: {venue.capacity.toLocaleString()}</p>
                          <p className="capitalize text-orange-400">{venue.venueType?.toLowerCase()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Performers */}
              {event.performers && event.performers.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-400" />
                    Performers
                  </h3>
                  <div className="space-y-3">
                    {event.performers.map((performer) => (
                      <div key={performer.performerId} className="flex items-start gap-3">
                        <div className="flex-1">
                          <h4 className="text-white font-medium text-sm">{performer.name}</h4>
                          <p className="text-neutral-400 text-xs mt-1">{performer.genre}</p>
                          {performer.performanceStartTime && (
                            <p className="text-neutral-500 text-xs mt-1">
                              {formatTime(performer.performanceStartTime)}
                              {performer.performanceEndTime && ` - ${formatTime(performer.performanceEndTime)}`}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Quick Actions */}
              <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/30">
                <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
                <div className="space-y-3 text-sm">
                  <p className="text-neutral-400">
                    Having trouble selecting tickets? Contact our support team for assistance.
                  </p>
                  <button className="w-full py-2 bg-orange-400 text-black font-medium rounded-xl hover:bg-orange-500 transition-all duration-200">
                    Contact Support
                  </button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;