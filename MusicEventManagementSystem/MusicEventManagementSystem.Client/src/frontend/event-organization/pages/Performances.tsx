import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlaySquare, Search, Calendar, MapPin, User, Clock, CheckCircle, AlertCircle, XCircle, Plus, Edit, Trash2, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { performanceService } from '../services/performanceService';
import type { Performance } from '../services/performanceService';

const Performances = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [filteredPerformances, setFilteredPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [performanceToDelete, setPerformanceToDelete] = useState<Performance | null>(null);

  const statusOptions = [
    { value: 'ALL', label: 'All Performances' },
    { value: 'PLANNED', label: 'Planned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  useEffect(() => {
    loadPerformances();
  }, []);

  useEffect(() => {
    filterAndSortPerformances();
  }, [performances, searchTerm, statusFilter, sortBy, sortOrder]);

  const loadPerformances = async () => {
    try {
      setLoading(true);
      let data;
      if (eventId) {
        data = await performanceService.getPerformancesByEventId(parseInt(eventId));
      } else {
        data = await performanceService.getAllPerformances();
      }
      setPerformances(data);
    } catch (err) {
      setError('Failed to load performances');
      console.error('Error loading performances:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPerformances = () => {
    let result = [...performances];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(performance => 
        performance.performer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        performance.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        performance.event?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(performance => performance.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "performer":
          aValue = a.performer?.name || "";
          bValue = b.performer?.name || "";
          break;
        case "venue":
          aValue = a.venue?.name || "";
          bValue = b.venue?.name || "";
          break;
        case "startTime":
          aValue = new Date(a.startTime).getTime();
          bValue = new Date(b.startTime).getTime();
          break;
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        default:
          aValue = a.performer?.name || "";
          bValue = b.performer?.name || "";
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredPerformances(result);
  };

  const handleDeletePerformance = async (performance: Performance) => {
    setPerformanceToDelete(performance);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!performanceToDelete) return;

    try {
      await performanceService.deletePerformance(performanceToDelete.id);
      setPerformances(prev => prev.filter(p => p.id !== performanceToDelete.id));
      setDeleteModalOpen(false);
      setPerformanceToDelete(null);
    } catch (err) {
      setError('Failed to delete performance');
      console.error('Error deleting performance:', err);
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'IN_PROGRESS':
        return <Clock className="w-4 h-4 text-lime-400" />;
      case 'PLANNED':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-400/20 text-green-400 border-green-400/30';
      case 'IN_PROGRESS':
        return 'bg-lime-400/20 text-lime-400 border-lime-400/30';
      case 'PLANNED':
        return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
      case 'CANCELLED':
        return 'bg-red-400/20 text-red-400 border-red-400/30';
      default:
        return 'bg-neutral-400/20 text-neutral-400 border-neutral-400/30';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  const getPerformanceStats = () => {
    return {
      total: performances.length,
      planned: performances.filter(p => p.status === 'PLANNED').length,
      inProgress: performances.filter(p => p.status === 'IN_PROGRESS').length,
      completed: performances.filter(p => p.status === 'COMPLETED').length,
      cancelled: performances.filter(p => p.status === 'CANCELLED').length
    };
  };

  const handleEditPerformance = (performance: Performance, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/event-organization/performances/${performance.id}/edit`);
  };

  const handleDeleteClick = (performance: Performance, e: React.MouseEvent) => {
    e.stopPropagation();
    handleDeletePerformance(performance);
  };

  const stats = getPerformanceStats();

  const statsCards = [
    {
      title: "Total Performances",
      value: stats.total.toString(),
      change: `+${stats.planned} planned`,
      trend: "up",
      icon: <PlaySquare className="w-5 h-5" />,
      color: "lime"
    },
    {
      title: "In Progress",
      value: stats.inProgress.toString(),
      change: "+12.5%",
      trend: "up",
      icon: <Clock className="w-5 h-5" />,
      color: "blue"
    },
    {
      title: "Completed",
      value: stats.completed.toString(),
      change: "+8.1%",
      trend: "up",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "purple"
    },
    {
      title: "This Week",
      value: performances.filter(p => {
        const perfDate = new Date(p.startTime);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return perfDate >= weekAgo && perfDate <= now;
      }).length.toString(),
      change: "+15.2%",
      trend: "up",
      icon: <Calendar className="w-5 h-5" />,
      color: "orange"
    },
  ];

  if (loading) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-1">
            {eventId ? 'Event Performances' : 'Performances'}
          </h1>
          <p className="text-neutral-400 text-sm">
            {eventId ? 'Performances for the selected event' : 'Manage performance creation, scheduling, and details'}
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-1">
            {eventId ? 'Event Performances' : 'Performances'}
          </h1>
          <p className="text-neutral-400 text-sm">
            {eventId ? 'Performances for the selected event' : 'Manage performance creation, scheduling, and details'}
          </p>
        </div>
        <div className="text-center py-8 text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="text-white h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {eventId ? 'Event Performances' : 'Performances'}
          </h1>
          <p className="text-neutral-400 text-sm">
            {eventId ? 'Performances for the selected event' : 'Manage performance creation, scheduling, and details'}
          </p>
        </div>
        <button
          onClick={() => navigate('/event-organization/performances/add')}
          className="bg-pink-400/20 hover:bg-pink-400/30 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 text-pink-400 font-medium border border-pink-400/30 hover:border-pink-400/50"
        >
          <Plus className="w-4 h-4" />
          Add Performance
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-3 hover:border-lime-400/30 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.color === 'lime' ? 'bg-lime-400/20 text-lime-400' : 
                                                stat.color === 'blue' ? 'bg-blue-400/20 text-blue-400' :
                                                stat.color === 'purple' ? 'bg-purple-400/20 text-purple-400' :
                                                'bg-orange-400/20 text-orange-400'}`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-lime-400' : 'text-red-400'}`}>
                {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-neutral-400 text-xs mb-1">{stat.title}</p>
              <h3 className="text-lg font-bold text-white group-hover:text-lime-400 transition-colors">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Controls */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search performances..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all text-sm min-w-[140px]"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-neutral-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all text-sm"
            >
              <option value="performer">Performer</option>
              <option value="venue">Venue</option>
              <option value="startTime">Start Time</option>
              <option value="status">Status</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-lime-400/30"
            >
              {sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
          <Filter className="w-3 h-3" />
          <span>Showing {filteredPerformances.length} of {performances.length} performances</span>
        </div>
      </div>

      {/* Performances Grid */}
      {filteredPerformances.length === 0 ? (
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-12 text-center">
          <PlaySquare className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
          <h3 className="text-xl font-semibold text-neutral-400 mb-2">
            {searchTerm || statusFilter !== 'ALL' ? 'No performances found' : 'No performances yet'}
          </h3>
          <p className="text-neutral-500 mb-6">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first performance to get started'
            }
          </p>
          {!searchTerm && statusFilter === 'ALL' && (
            <button
              onClick={() => navigate('/event-organization/performances/add')}
              className="bg-pink-400/20 hover:bg-pink-400/30 px-4 py-2 rounded-xl text-pink-400 font-medium transition-all duration-200 border border-pink-400/30 hover:border-pink-400/50"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Add Your First Performance
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-auto">
          {filteredPerformances.map((performance) => (
            <div
              key={performance.id}
              onClick={() => navigate(`/event-organization/performances/${performance.id}`)}
              className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:border-lime-400/30 transition-all duration-200 cursor-pointer p-4 rounded-xl group"
            >
              {/* Status Badge and Actions */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <PlaySquare className="w-5 h-5 text-lime-400" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(performance.status)}`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(performance.status)}
                      <span>{performance.status || 'Unknown'}</span>
                    </div>
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleEditPerformance(performance, e)}
                    className="p-1.5 hover:bg-neutral-600 rounded-lg transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(performance, e)}
                    className="p-1.5 hover:bg-red-900/50 rounded-lg transition-all duration-200 text-neutral-400 hover:text-red-400 border border-transparent hover:border-red-400/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Performance Info */}
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-lime-400 transition-colors">
                  {performance.performer?.name || 'Unknown Performer'}
                </h3>
                {performance.event?.name && (
                  <p className="text-neutral-400 text-sm">
                    Event: {performance.event.name}
                  </p>
                )}
              </div>

              {/* Performance Details */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-neutral-400">
                  <MapPin className="w-4 h-4" />
                  <span>{performance.venue?.name || 'No venue specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(performance.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(performance.endTime)}</span>
                </div>
                {performance.setupTime > 0 && (
                  <div className="flex items-center gap-2 text-neutral-400">
                    <User className="w-4 h-4" />
                    <span>Setup: {performance.setupTime} min</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-800 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-400/20 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Delete Performance</h2>
            </div>
            
            <p className="text-neutral-400 mb-6">
              Are you sure you want to delete the performance for "{performanceToDelete?.performer?.name}"? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 p-3 bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-200 text-white border border-red-500/30 hover:border-red-500"
              >
                Delete Performance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performances;