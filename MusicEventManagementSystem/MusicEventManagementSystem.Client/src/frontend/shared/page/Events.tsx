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
    <div className="text-white h-full flex flex-col p-2">
      {/* Header */}
      <div className="">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Events</h1>
            <p className="text-neutral-400 text-sm">Discover amazing events near you</p>
          </div>
          <button className="bg-orange-400 hover:bg-orange-500 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold shadow-lg">
            <Filter size={16} />
            Filters
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by performer or event name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-all duration-200"
                />
              </div>
            </div>
          </div> 
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white text-base focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
            >
              <option value="all">All Categories</option>
              <option value="concert">Concerts</option>
              <option value="festival">Festivals</option>
              <option value="theater">Theater</option>
              <option value="sports">Sports</option>
            </select>
          </div>
        </div>
      </Card>

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
                  <div className="p-2 bg-orange-500/20 rounded-xl">
                    <Ticket className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-lg">{event.name}</h4>
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
                <button className="bg-orange-500 hover:bg-orange-600 text-black px-4 py-2 rounded-xl text-sm transition-all duration-200">
                  View Details
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;