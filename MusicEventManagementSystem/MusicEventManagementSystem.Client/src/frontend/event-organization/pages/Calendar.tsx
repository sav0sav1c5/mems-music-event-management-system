import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Layout, LayoutGrid, Clock } from 'lucide-react';
import { Button } from '../../shared/components/ui/button';
import { Card } from '../../shared/components/ui/card';
import { Badge } from '../../shared/components/ui/badge';
import { eventService } from '../services/eventService';
import type { Event } from '../services/eventService';
import { performanceService } from '../services/performanceService';
import type { Performance } from '../services/performanceService';
import { stageService } from '../services/stageService';
import type { Stage } from '../services/stageService';

const Calendar = () => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [displayMode, setDisplayMode] = useState<'calendar' | 'timeline'>(() => {
    // Check if redirected from timeline page
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('view') === 'timeline' ? 'timeline' : 'calendar';
  });
  const [showEvents, setShowEvents] = useState(true);
  const [showPerformances, setShowPerformances] = useState(true);

  // Generate 24 hour timeline for timeline view
  const hours = Array.from({ length: 24 }, (_, i) => i);

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const [eventsData, performancesData, stagesData] = await Promise.all([
        eventService.getAllEvents(),
        performanceService.getAllPerformances(),
        stageService.getStages()
      ]);
      setEvents(eventsData);
      setPerformances(performancesData);
      setStages(stagesData);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const dayEvents: Array<Event | Performance> = [];

    if (showEvents) {
      events.forEach(event => {
        try {
          const eventDate = new Date(event.startDate);
          if (!isNaN(eventDate.getTime())) {
            const eventDateString = eventDate.toISOString().split('T')[0];
            if (eventDateString === dateString) {
              dayEvents.push(event);
            }
          }
        } catch (error) {
          console.warn('Invalid event date:', event.startDate, error);
        }
      });
    }

    if (showPerformances) {
      performances.forEach(performance => {
        try {
          const performanceDate = new Date(performance.startDate);
          if (!isNaN(performanceDate.getTime())) {
            const performanceDateString = performanceDate.toISOString().split('T')[0];
            if (performanceDateString === dateString) {
              dayEvents.push(performance);
            }
          }
        } catch (error) {
          console.warn('Invalid performance date:', performance.startDate, error);
        }
      });
    }

    return dayEvents;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-400/20 text-green-400 border-green-400/30';
      case 'IN PROGRESS':
        return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case 'PLANNED':
        return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
      case 'CANCELLED':
        return 'bg-red-400/20 text-red-400 border-red-400/30';
      default:
        return 'bg-neutral-400/20 text-neutral-400 border-neutral-400/30';
    }
  };

  const isEvent = (item: Event | Performance): item is Event => {
    return 'location' in item;
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.warn('Error formatting time:', dateString, error);
      return 'Invalid time';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getTimelineEvents = () => {
    const allItems: Array<(Event | Performance) & { itemType: 'event' | 'performance' }> = [];
    
    if (showEvents) {
      events.forEach(event => {
        allItems.push({ ...event, itemType: 'event' as const });
      });
    }
    
    if (showPerformances) {
      performances.forEach(performance => {
        allItems.push({ ...performance, itemType: 'performance' as const });
      });
    }

    return allItems.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  const getItemsForStageAndDate = (stage: Stage, date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const items: Array<{ item: Event | Performance; type: 'event' | 'performance'; startHour: number; duration: number }> = [];

    if (showEvents) {
      events.forEach(event => {
        try {
          const eventDate = new Date(event.startDate);
          const eventDateString = eventDate.toISOString().split('T')[0];
          
          if (eventDateString === dateString && event.location.includes(stage.name)) {
            const startHour = eventDate.getHours() + (eventDate.getMinutes() / 60);
            const endDate = event.endDate ? new Date(event.endDate) : new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
            const endHour = endDate.getHours() + (endDate.getMinutes() / 60);
            const duration = Math.max(0.5, endHour - startHour);
            
            items.push({
              item: event,
              type: 'event',
              startHour,
              duration
            });
          }
        } catch (error) {
          console.warn('Invalid event date:', event.startDate, error);
        }
      });
    }

    if (showPerformances) {
      performances.forEach(performance => {
        try {
          const performanceDate = new Date(performance.startDate);
          const performanceDateString = performanceDate.toISOString().split('T')[0];
          
          if (performanceDateString === dateString && 
              ((performance.venue && performance.venue.includes(stage.name)) || 
               (performance.stage && performance.stage.includes(stage.name)))) {
            const startHour = performanceDate.getHours() + (performanceDate.getMinutes() / 60);
            const endDate = new Date(performance.endDate);
            const endHour = endDate.getHours() + (endDate.getMinutes() / 60);
            const duration = Math.max(0.5, endHour - startHour);
            
            items.push({
              item: performance,
              type: 'performance',
              startHour,
              duration
            });
          }
        } catch (error) {
          console.warn('Invalid performance date:', performance.startDate, error);
        }
      });
    }

    return items;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 1);
      } else {
        newDate.setDate(prev.getDate() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimelineTime = (hour: number) => {
    const hours = Math.floor(hour);
    const minutes = Math.round((hour - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const renderTimelineView = () => {
    return (
      <Card className="bg-neutral-900/60 border-neutral-800 flex-1 overflow-hidden">
        <div className="h-full flex flex-col">

          {/* Header with hours */}
          <div className="flex border-b border-neutral-800">
            {/* Stages column header */}
            <div className="w-48 p-4 bg-neutral-800/50 border-r border-neutral-800 flex items-center">
              <h3 className="font-semibold text-white">Stages</h3>
            </div>
            
            {/* Hours header - scrollable */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-x-auto overflow-y-hidden"
            >
              <div className="flex" style={{ minWidth: '1920px' }}>
                {hours.map(hour => (
                  <div key={hour} className="w-20 p-2 text-center border-r border-neutral-800 bg-neutral-800/30">
                    <div className="text-sm text-neutral-400">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Timeline content */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex">
              {/* Stages column */}
              <div className="w-48 border-r border-neutral-800">
                {stages.map((stage, stageIndex) => (
                  <div 
                    key={stage.id} 
                    className={`h-16 p-4 flex items-center border-b border-neutral-800 ${stageIndex % 2 === 0 ? 'bg-neutral-800/20' : 'bg-neutral-800/40'}`}
                  >
                    <div>
                      <p className="font-medium text-white text-sm">{stage.name}</p>
                      <p className="text-neutral-400 text-xs">{stage.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline grid - scrollable */}
              <div className="flex-1 overflow-x-auto">
                <div className="relative" style={{ minWidth: '1920px' }}>
                  {stages.map((stage, stageIndex) => {
                    const stageItems = getItemsForStageAndDate(stage, selectedDate);
                    
                    return (
                      <div 
                        key={stage.id}
                        className={`h-16 border-b border-neutral-800 relative ${stageIndex % 2 === 0 ? 'bg-neutral-900/20' : 'bg-neutral-900/40'}`}
                      >
                        {/* Hour grid lines */}
                        {hours.map(hour => (
                          <div 
                            key={hour}
                            className="absolute w-20 h-full border-r border-neutral-800/50"
                            style={{ left: `${hour * 80}px` }}
                          />
                        ))}

                        {/* Timeline items */}
                        {stageItems.map((timelineItem, itemIndex) => {
                          const { item, type, startHour, duration } = timelineItem;
                          const leftPosition = startHour * 80;
                          const width = duration * 80;
                          
                          return (
                            <div
                              key={`${type}-${item.id}-${itemIndex}`}
                              className={`absolute h-12 mt-2 rounded-lg border-2 cursor-pointer group hover:scale-105 transition-all duration-200 ${getStatusColor(item.status).replace('bg-', 'bg-').replace('/20', '/80').replace('text-', 'border-')}`}
                              style={{
                                left: `${leftPosition}px`,
                                width: `${Math.max(width, 40)}px`
                              }}
                              onClick={() => {
                                if (type === 'event') {
                                  navigate(`/event-organization/events/${item.id}`);
                                } else {
                                  navigate(`/event-organization/performances/${item.id}`);
                                }
                              }}
                            >
                              <div className="h-full px-2 py-1 overflow-hidden">
                                <div className="flex items-center gap-1 mb-1">
                                  {type === 'event' ? (
                                    <CalendarIcon className="w-3 h-3 text-white" />
                                  ) : (
                                    <Clock className="w-3 h-3 text-white" />
                                  )}
                                  <span className="text-white text-xs font-medium truncate">
                                    {item.name}
                                  </span>
                                </div>
                                <div className="text-white text-xs opacity-80">
                                  {formatTimelineTime(startHour)} - {formatTimelineTime(startHour + duration)}
                                </div>
                              </div>
                              
                              {/* Hover tooltip */}
                              <div className="absolute bottom-full left-0 mb-2 p-2 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 min-w-48">
                                <div className="text-white font-medium mb-1">{item.name}</div>
                                <div className="text-neutral-400 text-xs mb-1">
                                  {formatTimelineTime(startHour)} - {formatTimelineTime(startHour + duration)}
                                </div>
                                {type === 'event' ? (
                                  <div className="text-neutral-400 text-xs">
                                    📅 Event • {(item as Event).location}
                                  </div>
                                ) : (
                                  <div className="text-neutral-400 text-xs">
                                    🎭 Performance • {(item as Performance).artistName || (item as Performance).performer || 'Unknown artist'}
                                  </div>
                                )}
                                <Badge className={`${getStatusColor(item.status).replace('bg-', 'text-').replace('/80', '')} mt-1 text-xs`}>
                                  {item.status}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const monthDays = getMonthDays(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Calendar</h1>
            <p className="text-neutral-400">
              Event and performance scheduling
            </p>
          </div>
        </div>
        <div className="bg-neutral-800/50 rounded-xl p-6 animate-pulse">
          <div className="h-96 bg-neutral-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-neutral-400">
            Event and performance scheduling
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/event-organization/events/add')}
            className="bg-lime-400/20 hover:bg-lime-400/30 px-4 py-2 rounded-xl text-lime-400 font-medium border border-lime-400/30 hover:border-lime-400/50 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
          <Button
            onClick={() => navigate('/event-organization/performances/add')}
            className="bg-purple-400/20 hover:bg-purple-400/30 px-4 py-2 rounded-xl text-purple-400 font-medium border border-purple-400/30 hover:border-purple-400/50 transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Performance
          </Button>
          <Button
            onClick={() => setDisplayMode(displayMode === 'calendar' ? 'timeline' : 'calendar')}
            className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl text-white font-medium border border-neutral-700 hover:border-pink-400/30 transition-all duration-200 group"
          >
            {displayMode === 'calendar' ? (
              <>
                <Layout className="w-4 h-4 mr-2 group-hover:text-pink-400 transition-colors" />
                <span className="group-hover:text-pink-400 transition-colors">Timeline View</span>
              </>
            ) : (
              <>
                <LayoutGrid className="w-4 h-4 mr-2 group-hover:text-pink-400 transition-colors" />
                <span className="group-hover:text-pink-400 transition-colors">Calendar View</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Display Mode Toggle & Controls */}
      <Card className="bg-neutral-900/60 border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {displayMode === 'calendar' && (
              <>
                <Button
                  onClick={() => navigateMonth('prev')}
                  variant="outline"
                  size="sm"
                  className="border-neutral-700 text-neutral-400 hover:text-white hover:border-pink-400/50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-semibold text-white">{monthName}</h2>
                <Button
                  onClick={() => navigateMonth('next')}
                  variant="outline"
                  size="sm"
                  className="border-neutral-700 text-neutral-400 hover:text-white hover:border-pink-400/50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
            {displayMode === 'timeline' && (
              <>
                <Button
                  onClick={() => navigateDate('prev')}
                  variant="outline"
                  size="sm"
                  className="border-neutral-700 text-neutral-400 hover:text-white hover:border-pink-400/50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-semibold text-white">
                  {formatDate(selectedDate)}
                </h2>
                <Button
                  onClick={() => navigateDate('next')}
                  variant="outline"
                  size="sm"
                  className="border-neutral-700 text-neutral-400 hover:text-white hover:border-pink-400/50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowEvents(!showEvents)}
                size="sm"
                className={`${showEvents ? 'bg-pink-400/20 text-pink-400 border-pink-400/30' : 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}
              >
                Events
              </Button>
              <Button
                onClick={() => setShowPerformances(!showPerformances)}
                size="sm"
                className={`${showPerformances ? 'bg-purple-400/20 text-purple-400 border-purple-400/30' : 'bg-neutral-800 text-neutral-400 border-neutral-700'}`}
              >
                Performances
              </Button>
            </div>
            <Button
              onClick={() => {
                if (displayMode === 'calendar') {
                  setCurrentDate(new Date());
                } else {
                  setSelectedDate(new Date());
                }
              }}
              size="sm"
              className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 hover:border-pink-400/50"
            >
              Today
            </Button>
          </div>
        </div>
      </Card>

      {/* Content */}
      {displayMode === 'timeline' ? (
        renderTimelineView()
      ) : (
        <>
          {/* Calendar Grid */}
          <Card className="bg-neutral-900/60 border-neutral-800 p-6 flex-1">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center font-medium text-neutral-400 border-b border-neutral-800">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day, index) => {
                if (!day) {
                  return <div key={index} className="min-h-24 p-1"></div>;
                }

                const dayEvents = getEventsForDate(day);
                const isToday = day.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-24 p-2 border border-neutral-800 rounded-lg ${isToday ? 'bg-pink-400/10 border-pink-400/30' : 'hover:bg-neutral-800/50'} transition-colors`}
                  >
                    <div className={`text-sm font-medium mb-2 ${isToday ? 'text-pink-400' : 'text-white'}`}>
                      {day.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((item, eventIndex) => {
                        const isEventItem = isEvent(item);
                        return (
                          <div
                            key={`${isEventItem ? 'event' : 'performance'}-${item.id}`}
                            onClick={() => {
                              if (isEventItem) {
                                navigate(`/event-organization/events/${item.id}`);
                              } else {
                                navigate(`/event-organization/performances/${item.id}`);
                              }
                            }}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(item.status)}`}
                          >
                            <div className="truncate font-medium">
                              {isEventItem ? `📅 ${item.name}` : `🎭 ${item.name}`}
                            </div>
                            <div className="truncate text-xs opacity-75">
                              {formatTime(item.startDate)}
                            </div>
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-neutral-400 text-center py-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Legend */}
          <Card className="bg-neutral-900/60 border-neutral-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-pink-400 rounded"></div>
                  <span className="text-sm text-neutral-400">Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-400 rounded"></div>
                  <span className="text-sm text-neutral-400">Performances</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30">Planned</Badge>
                  <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">In Progress</Badge>
                  <Badge className="bg-green-400/20 text-green-400 border-green-400/30">Completed</Badge>
                  <Badge className="bg-red-400/20 text-red-400 border-red-400/30">Cancelled</Badge>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Calendar;