import { useState, useEffect } from "react";
import { Search, Filter, Calendar, MapPin, Ticket } from "lucide-react";
import { EventService } from "../../event-organization/services/eventService";
import type { EventResponse } from "../../event-organization/types/api/event";
import { Card } from "../../ticket-sales/components/card";

const Events = () => {
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

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
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
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
                      <p className="text-neutral-400 text-sm">{event.status}</p>
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
                    <span className="text-neutral-300 text-sm">{event.locationId || "TBA"}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                  <div className="text-orange-400 font-medium text-lg">
                    ${Math.floor(Math.random() * 100 + 20)}
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-orange-400 text-black font-medium hover:bg-orange-500 transition-all duration-200 shadow-lg text-sm">
                    View Details
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;