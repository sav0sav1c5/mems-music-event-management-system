import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  User,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  ArrowRight,
  Workflow
} from 'lucide-react';
import { negotiationService } from '../services/negotiationService';
import type { NegotiationDto, CreateNegotiationDto } from '../services/negotiationService';
import { performerService } from '../services/performerService';
import type { PerformerDto } from '../services/performerService';
import { eventService } from '../services/eventService';
import type { EventDto } from '../services/eventService';

// Status configurations
const statusConfig = {
  InProgress: { color: 'bg-blue-500', icon: Clock, label: 'In Progress' },
  Completed: { color: 'bg-green-500', icon: CheckCircle, label: 'Completed' },
  Cancelled: { color: 'bg-red-500', icon: AlertCircle, label: 'Cancelled' },
  Pending: { color: 'bg-yellow-500', icon: Clock, label: 'Pending' }
};

interface CreateNegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateNegotiationDto) => void;
  loading: boolean;
}

const CreateNegotiationModal: React.FC<CreateNegotiationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState<CreateNegotiationDto>({
    proposedFee: 0,
    status: 'InProgress',
    startDate: new Date(),
    endDate: new Date(),
    performerId: 0,
    eventId: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [performers, setPerformers] = useState<PerformerDto[]>([]);
  const [events, setEvents] = useState<EventDto[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    if (formData.proposedFee <= 0) newErrors.proposedFee = 'Proposed fee must be greater than 0';
    if (formData.performerId <= 0) newErrors.performerId = 'Please select a performer';
    if (formData.eventId <= 0) newErrors.eventId = 'Please select an event';
    if (formData.endDate <= formData.startDate) newErrors.endDate = 'End date must be after start date';

    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof CreateNegotiationDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const fetchPerformers = async () => {
    try {
      const data = await performerService.getAllPerformers();
      setPerformers(data);
    } catch (error) {
      console.error('Failed to fetch performers:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPerformers();
      fetchEvents();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Negotiation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proposed Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Proposed Fee ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.proposedFee}
                onChange={(e) => handleInputChange('proposedFee', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.proposedFee ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Enter proposed fee"
              />
              {errors.proposedFee && (
                <p className="text-red-400 text-sm mt-1">{errors.proposedFee}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="InProgress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Event */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                Event ({events.length} available)
              </label>
              <select
                value={formData.eventId}
                onChange={(e) => handleInputChange('eventId', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.eventId ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value={0}>Select an event</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
              {errors.eventId && (
                <p className="text-red-400 text-sm mt-1">{errors.eventId}</p>
              )}
            </div>

            {/* Performer */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Performer ({performers.length} available)
              </label>
              <select
                value={formData.performerId}
                onChange={(e) => handleInputChange('performerId', parseInt(e.target.value) || 0)}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.performerId ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value={0}>Select a performer</option>
                {performers.map(performer => (
                  <option key={performer.performerId} value={performer.performerId}>
                    {performer.name}
                  </option>
                ))}
              </select>
              {errors.performerId && (
                <p className="text-red-400 text-sm mt-1">{errors.performerId}</p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="datetime-local"
                value={formData.startDate.toISOString().slice(0, 16)}
                onChange={(e) => handleInputChange('startDate', new Date(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date
              </label>
              <input
                type="datetime-local"
                value={formData.endDate.toISOString().slice(0, 16)}
                onChange={(e) => handleInputChange('endDate', new Date(e.target.value))}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.endDate && (
                <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Negotiation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const NegotiationsNew: React.FC = () => {
  const navigate = useNavigate();
  const [negotiations, setNegotiations] = useState<NegotiationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchNegotiations();
  }, []);

  const fetchNegotiations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await negotiationService.getAllNegotiations();
      setNegotiations(data);
    } catch (err) {
      setError('Failed to fetch negotiations. Please try again.');
      console.error('Error fetching negotiations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNegotiation = async (formData: CreateNegotiationDto) => {
    try {
      setCreateLoading(true);
      const newNegotiation = await negotiationService.createNegotiation(formData);
      setNegotiations(prev => [newNegotiation, ...prev]);
      setIsCreateModalOpen(false);
      setError(null);
    } catch (err) {
      setError('Failed to create negotiation. Please try again.');
      console.error('Error creating negotiation:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteNegotiation = async (id: number) => {
    if (!confirm('Are you sure you want to delete this negotiation?')) return;

    try {
      await negotiationService.deleteNegotiation(id);
      setNegotiations(prev => prev.filter(n => n.negotiationId !== id));
    } catch (err) {
      setError('Failed to delete negotiation. Please try again.');
      console.error('Error deleting negotiation:', err);
    }
  };

  const handleViewWorkflow = (negotiationId: number) => {
    navigate(`/negotiations/${negotiationId}/workflow`);
  };

  // Filter negotiations
  const filteredNegotiations = negotiations.filter(negotiation => {
    const matchesSearch = 
      negotiation.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      negotiation.performerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      negotiation.negotiationId.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || negotiation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Negotiation Management</h1>
              <p className="text-gray-400">Manage performer negotiations and workflow processes</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Negotiation
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total</p>
                  <p className="text-white text-2xl font-bold">{negotiations.length}</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-full">
                  <Workflow className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">In Progress</p>
                  <p className="text-white text-2xl font-bold">
                    {negotiations.filter(n => n.status === 'InProgress').length}
                  </p>
                </div>
                <div className="bg-yellow-500 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Completed</p>
                  <p className="text-white text-2xl font-bold">
                    {negotiations.filter(n => n.status === 'Completed').length}
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Value</p>
                  <p className="text-white text-xl font-bold">
                    {formatCurrency(negotiations.reduce((sum, n) => sum + n.proposedFee, 0))}
                  </p>
                </div>
                <div className="bg-purple-500 p-3 rounded-full">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search negotiations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Negotiations List */}
        {filteredNegotiations.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <Workflow className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No negotiations found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first negotiation'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create First Negotiation
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredNegotiations.map((negotiation) => {
              const status = getStatusConfig(negotiation.status);
              const StatusIcon = status.icon;
              
              return (
                <div
                  key={negotiation.negotiationId}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">ID:</span>
                        <span className="text-white font-mono">#{negotiation.negotiationId}</span>
                      </div>
                      <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full text-white ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewWorkflow(negotiation.negotiationId)}
                        className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                        title="View Workflow"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNegotiation(negotiation.negotiationId)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Event</p>
                      <p className="text-white font-medium">{negotiation.eventName || `Event #${negotiation.eventId}`}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Performer</p>
                      <p className="text-white font-medium">{negotiation.performerName || `Performer #${negotiation.performerId}`}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Proposed Fee</p>
                      <p className="text-white font-bold text-lg">{formatCurrency(negotiation.proposedFee)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Period</p>
                      <p className="text-white text-sm">
                        {formatDate(negotiation.startDate)} - {formatDate(negotiation.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-between">
                    <div className="text-gray-400 text-sm">
                      Created: {formatDate(negotiation.startDate)}
                    </div>
                    <button
                      onClick={() => handleViewWorkflow(negotiation.negotiationId)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 transition-colors"
                    >
                      View Workflow
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Negotiation Modal */}
        <CreateNegotiationModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateNegotiation}
          loading={createLoading}
        />
      </div>
    </div>
  );
};

export default NegotiationsNew;