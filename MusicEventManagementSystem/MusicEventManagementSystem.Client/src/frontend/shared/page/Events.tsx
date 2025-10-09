import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EventsService } from "../../shared/services/client/eventsService";
import type { ClientEventDto } from "../../shared/types/api/event";

// Import komponenti
import { EventsHeader } from "../components/events/EventsHeader";
import { EventsFilters } from "../components/events/EventsFilters";
import { EventsList } from "../components/events/EventsList";

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<ClientEventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    keyword: "",
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    city: "",
    status: "all"
  });
  const [showFilters, setShowFilters] = useState(false);

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

  const handleViewDetails = (event: ClientEventDto) => {
    // Navigate to event details page instead of opening modal
    navigate(`/client/browse-events/${event.id}`);
  };

  const handleSearch = () => {
    if (searchFilters.keyword || searchFilters.startDate || searchFilters.endDate || searchFilters.city || searchFilters.status !== "all") {
      searchEvents();
    } else {
      fetchEvents();
    }
  };

  const handleClearFilters = () => {
    setSearchFilters({
      keyword: "",
      startDate: undefined,
      endDate: undefined,
      city: "",
      status: "all"
    });
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
      <div className="text-white h-full flex flex-col p-4 m-1">
        {/* Header */}
        <EventsHeader 
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        />

        {/* Search and Filters */}
        <EventsFilters
          searchFilters={searchFilters}
          setSearchFilters={setSearchFilters}
          showFilters={showFilters}
          onSearch={handleSearch}
          onClear={handleClearFilters}
        />

        {/* Events Grid */}
        <div className="flex-1 overflow-y-auto">
          <EventsList
            loading={loading}
            events={events}
            onViewDetails={handleViewDetails}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default Events;