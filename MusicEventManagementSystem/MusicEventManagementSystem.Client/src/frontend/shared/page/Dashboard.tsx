import { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, Ticket, Heart, ShoppingCart, Star, Music, CreditCard, TrendingUp, Users } from "lucide-react";
import { EventService } from "../../event-organization/services/eventService";
import { PerformanceService } from "../../event-organization/services/performanceService";
import type { EventResponse } from "../../event-organization/types/api/event";
import type { PerformanceResponse } from "../../event-organization/types/api/performance";
import { Card, KpiCard } from "../../ticket-sales/components/card";

interface EventWithPerformances extends EventResponse {
  performances?: PerformanceResponse[];
}

const Dashboard = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<EventWithPerformances[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<EventWithPerformances[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Mock customer stats
  const customerStats = [
    {
      title: "Tickets Purchased",
      value: "24",
      change: 12.5,
      trend: "up" as const,
      icon: Ticket,
    },
    {
      title: "Events Attended",
      value: "18",
      change: 8.2,
      trend: "up" as const,
      icon: Calendar,
    },
    {
      title: "Total Spent",
      value: "$2,850",
      change: 15.3,
      trend: "up" as const,
      icon: CreditCard,
    },
    {
      title: "Upcoming Events",
      value: "3",
      change: 5.1,
      trend: "up" as const,
      icon: Star,
    },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [eventsData, performancesData] = await Promise.all([
        EventService.getAllEvents(),
        PerformanceService.getAllPerformances()
      ]);

      const processedEvents = eventsData.map(event => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
        deletedAt: event.deletedAt ? new Date(event.deletedAt) : undefined
      }));

      // Get upcoming events (next 30 days)
      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      const upcoming = processedEvents
        .filter(event => event.startDate > now && event.startDate <= thirtyDaysFromNow)
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        .slice(0, 6);

      // Get featured events
      const featured = processedEvents
        .filter(event => event.startDate > now)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 4);

      setUpcomingEvents(upcoming);
      setFeaturedEvents(featured);
    } catch (err: any) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="text-white h-full flex flex-col p-2">
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-base">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white h-full flex flex-col p-2">
      {/* Header */}
      <div className="">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Client Dashboard</h1>
            <p className="text-neutral-400 text-sm">Discover amazing events and manage your tickets</p>
          </div>
          <button className="bg-orange-400 hover:bg-orange-500 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold shadow-lg">
            <ShoppingCart size={16} />
            Browse Events
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl mb-6">
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {customerStats.map((stat, index) => (
          <KpiCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType="percentage"
            color="orange"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Events */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Featured Events</h2>
            <button className="text-orange-400 hover:text-orange-300 text-sm transition-colors">
              View All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredEvents.map((event) => (
              <Card key={event.id} hover={true} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-xl">
                      <Music className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-lg">{event.name}</h4>
                      <p className="text-neutral-400 text-sm">{event.description?.slice(0, 50)}...</p>
                    </div>
                  </div>
                  <button className="p-2 bg-neutral-800 hover:bg-orange-600 rounded-xl transition-all duration-200">
                    <Heart size={16} className="text-neutral-400 hover:text-white" />
                  </button>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-400" />
                    <span className="text-neutral-300">{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    <span className="text-neutral-300">{event.locationId || "TBA"}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                  <div className="text-orange-400 font-medium">
                    From ${Math.floor(Math.random() * 100 + 20)}
                  </div>
                  <button className="bg-orange-500 hover:bg-orange-600 text-black px-4 py-2 rounded-xl text-sm transition-all duration-200">
                    Get Tickets
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Upcoming Events</h3>
            <div className="space-y-4">
              {upcomingEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 bg-neutral-800/30 rounded-xl">
                  <div className="p-2 bg-orange-500/20 rounded-xl">
                    <Calendar className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{event.name}</p>
                    <p className="text-neutral-400 text-xs">{formatDate(event.startDate)}</p>
                  </div>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-neutral-400 text-sm text-center py-4">No upcoming events</p>
              )}
            </div>
          </Card>


        </div>
      </div>
    </div>
  );
};

export default Dashboard;