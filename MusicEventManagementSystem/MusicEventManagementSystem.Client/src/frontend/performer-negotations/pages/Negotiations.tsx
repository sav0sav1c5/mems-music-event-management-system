import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Edit, Trash2, X, Handshake, ArrowUp, ArrowDown, CheckCircle, 
  Clock, Eye, Search, Filter 
} from "lucide-react";
import { negotiationService } from "../services/negotiationService";
import type { NegotiationDto, CreateNegotiationDto } from "../services/negotiationService";
import { performerService } from "../services/performerService";
import type { PerformerDto } from "../services/performerService";
import { eventService } from "../services/eventService";
import type { EventDto } from "../services/eventService";

const Negotiations = () => {
  const navigate = useNavigate();
  const [negotiations, setNegotiations] = useState<NegotiationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNegotiation, setEditingNegotiation] = useState<NegotiationDto | null>(null);
  const [performers, setPerformers] = useState<PerformerDto[]>([]);
  const [events, setEvents] = useState<EventDto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState<CreateNegotiationDto>({
    proposedFee: 0,
    status: '',
    startDate: new Date(),
    endDate: new Date(),
    performerId: 0,
    eventId: 0,
  });

  useEffect(() => {
    fetchNegotiations();
    fetchPerformers();
    fetchEvents();
  }, []);

  // Filter negotiations based on search term and status
  const filteredNegotiations = negotiations.filter(negotiation => {
    const matchesSearch = searchTerm === "" || 
      negotiation.negotiationId.toString().includes(searchTerm) ||
      negotiation.proposedFee.toString().includes(searchTerm) ||
      (negotiation.status && negotiation.status.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || negotiation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const fetchNegotiations = async () => {
    try {
      setLoading(true);
      const data = await negotiationService.getAllNegotiations();
      setNegotiations(data);
    } catch (err) {
      setError('Failed to fetch negotiations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformers = async () => {
    try {
      console.log('Fetching performers...');
      const data = await performerService.getAllPerformers();
      console.log('Performers fetched:', data);
      setPerformers(data);
    } catch (err) {
      console.error('Failed to fetch performers:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      console.log('Fetching events...');
      const data = await eventService.getAllEvents();
      console.log('Events fetched:', data);
      setEvents(data);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNegotiation) {
        const updated = await negotiationService.updateNegotiation(
          editingNegotiation.negotiationId,
          { ...formData, negotiationId: editingNegotiation.negotiationId }
        );
        setNegotiations(prev => 
          prev.map(item => item.negotiationId === updated.negotiationId ? updated : item)
        );
      } else {
        const created = await negotiationService.createNegotiation(formData);
        setNegotiations(prev => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError('Failed to save negotiation');
      console.error(err);
    }
  };

  const handleEdit = (negotiation: NegotiationDto) => {
    setEditingNegotiation(negotiation);
    setFormData({
      proposedFee: negotiation.proposedFee,
      status: negotiation.status,
      startDate: negotiation.startDate,
      endDate: negotiation.endDate,
      performerId: negotiation.performerId || 0,
      eventId: negotiation.eventId || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this negotiation?')) {
      try {
        await negotiationService.deleteNegotiation(id);
        setNegotiations(prev => prev.filter(item => item.negotiationId !== id));
      } catch (err) {
        setError('Failed to delete negotiation');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      proposedFee: 0,
      status: '',
      startDate: new Date(),
      endDate: new Date(),
      performerId: 0,
      eventId: 0,
    });
    setEditingNegotiation(null);
    setIsModalOpen(false);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const stats = [
    {
      title: "Active Negotiations",
      value: negotiations.filter(n => n.status === 'Active').length.toString(),
      change: "+15.2%",
      trend: "up",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "lime"
    },
    {
      title: "Pending",
      value: negotiations.filter(n => n.status === 'Pending').length.toString(),
      change: "+8.7%",
      trend: "up",
      icon: <Clock className="w-5 h-5" />,
      color: "blue"
    },
    {
      title: "Completed",
      value: negotiations.filter(n => n.status === 'Completed').length.toString(),
      change: "+12.3%",
      trend: "up",
      icon: <Handshake className="w-5 h-5" />,
      color: "purple"
    },
    {
      title: "Total Value",
      value: formatPrice(negotiations.reduce((sum, negotiation) => sum + negotiation.proposedFee, 0)),
      change: "+18.5%",
      trend: "up",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "orange"
    },
  ];

  if (loading) return <div className="text-center py-8 text-white">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-400">{error}</div>;

  return (
    <div className="text-white h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-1">Negotiations</h1>
        <p className="text-neutral-400 text-sm">
          Manage negotiations and track their progress.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-3 hover:border-lime-400/30 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.color === 'lime' ? 'bg-lime-400/20 text-lime-400' : 
                                                stat.color === 'blue' ? 'bg-blue-400/20 text-blue-400' :
                                                stat.color === 'purple' ? 'bg-purple-400/20 text-purple-400' :
                                                'bg-orange-400/20 text-orange-400'}`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.trend === 'up' ? 'text-lime-400' : 'text-red-400'
              }`}>
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

      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">All Negotiations</h2>
          <p className="text-neutral-400 text-sm">Create and manage negotiations</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400"
        >
          <Plus className="w-4 h-4" />
          Add Negotiation
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 mb-4 hover:border-neutral-600/50 transition-all duration-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search negotiations by ID, fee, or status..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-400 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white appearance-none cursor-pointer transition-all"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        {(searchTerm || statusFilter !== "all") && (
          <div className="mt-3 text-sm text-neutral-400">
            Showing {filteredNegotiations.length} of {negotiations.length} negotiations
          </div>
        )}
      </div>

      {/* Negotiations Table */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl hover:border-lime-400/30 transition-all duration-200 flex-1 min-h-0 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead className="border-b border-neutral-700">
              <tr>
                <th className="text-left p-4 pl-10 text-neutral-300 font-semibold">ID</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Proposed Fee</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Status</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Start Date</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">End Date</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNegotiations.map((negotiation) => (
                <tr key={negotiation.negotiationId} className="border-b border-neutral-700/50 hover:bg-neutral-700/30 transition-all duration-200">
                  <td className="p-4 pl-10 text-white font-semibold">{negotiation.negotiationId}</td>
                  <td className="p-4 font-semibold text-lime-400">{formatPrice(negotiation.proposedFee)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      negotiation.status === 'Active' ? 'bg-lime-950/50 text-lime-400 border-lime-900/50' :
                      negotiation.status === 'Pending' ? 'bg-blue-950/50 text-blue-400 border-blue-900/50' :
                      negotiation.status === 'Completed' ? 'bg-purple-950/50 text-purple-400 border-purple-900/50' :
                      'bg-orange-950/50 text-orange-400 border-orange-900/50'
                    }`}>
                      {negotiation.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-300">{formatDate(negotiation.startDate)}</td>
                  <td className="p-4 text-neutral-300">{formatDate(negotiation.endDate)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/artist-communication/negotiations/workflow/${negotiation.negotiationId}`)}
                        className="p-1.5 hover:bg-neutral-600 rounded-lg transition-all duration-200 text-neutral-400 hover:text-blue-400 border border-transparent hover:border-blue-400/30"
                        title="View Workflow"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(negotiation)}
                        className="p-1.5 hover:bg-neutral-600 rounded-lg transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(negotiation.negotiationId)}
                        className="p-1.5 hover:bg-red-900/50 rounded-lg transition-all duration-200 text-neutral-400 hover:text-red-400 border border-transparent hover:border-red-400/30"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredNegotiations.length === 0 && negotiations.length > 0 && (
          <div className="text-center py-12 text-neutral-400">
            <p>No negotiations match your current filters.</p>
            <button 
              onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
              className="mt-2 text-lime-400 hover:text-lime-300 text-sm underline"
            >
              Clear filters
            </button>
          </div>
        )}
        {negotiations.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            <p>No negotiations found. Create your first negotiation!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingNegotiation ? 'Edit Negotiation' : 'Add New Negotiation'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Performer ({performers.length} available)</label>
                <select
                  value={formData.performerId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, performerId: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                  required
                >
                  <option value={0}>Select performer</option>
                  {performers.map(performer => (
                    <option key={performer.performerId} value={performer.performerId}>
                      {performer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Event ({events.length} available)</label>
                <select
                  value={formData.eventId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, eventId: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                  required
                >
                  <option value={0}>Select event</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Proposed Fee</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.proposedFee}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, proposedFee: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter proposed fee"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                  required
                >
                  <option value="">Select status</option>
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Start Date</label>
                <input
                  type="datetime-local"
                  value={new Date(formData.startDate).toISOString().slice(0, 16)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">End Date</label>
                <input
                  type="datetime-local"
                  value={new Date(formData.endDate).toISOString().slice(0, 16)}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type={"button" as const}
                  onClick={resetForm}
                  className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
                >
                  Cancel
                </button>
                <button
                  type={"submit" as const}
                  className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 rounded-xl transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400"
                >
                  {editingNegotiation ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Negotiations;
