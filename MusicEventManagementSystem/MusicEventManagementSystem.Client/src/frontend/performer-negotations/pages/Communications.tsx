import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, MessageSquare, ArrowUp, ArrowDown, CheckCircle, Clock } from "lucide-react";
import { communicationService } from "../services/communicationService";
import type { CommunicationDto } from "../services/communicationService";

const Communications = () => {
  const [communications, setCommunications] = useState<CommunicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommunication, setEditingCommunication] = useState<CommunicationDto | null>(null);
  const [formData, setFormData] = useState<Omit<CommunicationDto, 'communicationId' | 'sentAt' | 'repliedAt'>>({
    type: '',
    direction: '',
    content: '',
    negotiationId: 0,
  });

  useEffect(() => {
    fetchCommunications();
  }, []);

  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const data = await communicationService.getAllCommunications();
      setCommunications(data);
    } catch (err) {
      setError('Failed to fetch communications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCommunication) {
        const updated = await communicationService.updateCommunication(
          editingCommunication.communicationId,
          { ...formData, communicationId: editingCommunication.communicationId, sentAt: editingCommunication.sentAt, repliedAt: editingCommunication.repliedAt }
        );
        setCommunications(prev => 
          prev.map(item => item.communicationId === updated.communicationId ? updated : item)
        );
      } else {
        const created = await communicationService.createCommunication(formData);
        setCommunications(prev => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError('Failed to save communication');
      console.error(err);
    }
  };

  const handleEdit = (communication: CommunicationDto) => {
    setEditingCommunication(communication);
    setFormData({
      type: communication.type,
      direction: communication.direction,
      content: communication.content,
      negotiationId: communication.negotiationId || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this communication?')) {
      try {
        await communicationService.deleteCommunication(id);
        setCommunications(prev => prev.filter(item => item.communicationId !== id));
      } catch (err) {
        setError('Failed to delete communication');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      direction: '',
      content: '',
      negotiationId: 0,
    });
    setEditingCommunication(null);
    setIsModalOpen(false);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = [
    {
      title: "Total Communications",
      value: communications.length.toString(),
      change: "+12.5%",
      trend: "up",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "lime"
    },
    {
      title: "Incoming",
      value: communications.filter(c => c.direction === 'Incoming').length.toString(),
      change: "+8.2%",
      trend: "up",
      icon: <Clock className="w-5 h-5" />,
      color: "blue"
    },
    {
      title: "Outgoing",
      value: communications.filter(c => c.direction === 'Outgoing').length.toString(),
      change: "+15.3%",
      trend: "up",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "purple"
    },
    {
      title: "Replied",
      value: communications.filter(c => c.repliedAt).length.toString(),
      change: "+18.7%",
      trend: "up",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "orange"
    },
  ];

  if (loading) return <div className="text-center py-8 text-white">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-400">{error}</div>;

  return (
    <div className="text-white h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-1">Communications</h1>
        <p className="text-neutral-400 text-sm">
          Manage communications and track their status.
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
          <h2 className="text-xl font-bold text-white">All Communications</h2>
          <p className="text-neutral-400 text-sm">Create and manage communications</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400"
        >
          <Plus className="w-4 h-4" />
          Add Communication
        </button>
      </div>

      {/* Communications Table */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl hover:border-lime-400/30 transition-all duration-200 flex-1 min-h-0 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead className="border-b border-neutral-700">
              <tr>
                <th className="text-left p-4 pl-10 text-neutral-300 font-semibold">ID</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Type</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Direction</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Content</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Sent At</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Replied At</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {communications.map((communication) => (
                <tr key={communication.communicationId} className="border-b border-neutral-700/50 hover:bg-neutral-700/30 transition-all duration-200">
                  <td className="p-4 pl-10 text-white font-semibold">{communication.communicationId}</td>
                  <td className="p-4 text-neutral-300">{communication.type}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      communication.direction === 'Incoming' ? 'bg-blue-950/50 text-blue-400 border-blue-900/50' :
                      'bg-green-950/50 text-green-400 border-green-900/50'
                    }`}>
                      {communication.direction}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-300 max-w-xs truncate">{communication.content}</td>
                  <td className="p-4 text-neutral-300">{formatDate(communication.sentAt)}</td>
                  <td className="p-4 text-neutral-300">
                    {communication.repliedAt ? formatDate(communication.repliedAt) : 'Not replied'}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(communication)}
                        className="p-1.5 hover:bg-neutral-600 rounded-lg transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(communication.communicationId)}
                        className="p-1.5 hover:bg-red-900/50 rounded-lg transition-all duration-200 text-neutral-400 hover:text-red-400 border border-transparent hover:border-red-400/30"
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

        {communications.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            <p>No communications found. Create your first communication!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingCommunication ? 'Edit Communication' : 'Add New Communication'}
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
                <label className="block text-sm font-medium mb-2 text-neutral-300">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                  required
                >
                  <option value="">Select communication type</option>
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Text">Text</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Direction</label>
                <select
                  value={formData.direction}
                  onChange={(e) => setFormData(prev => ({ ...prev, direction: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                  required
                >
                  <option value="">Select direction</option>
                  <option value="Incoming">Incoming</option>
                  <option value="Outgoing">Outgoing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter communication content"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 rounded-xl transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400"
                >
                  {editingCommunication ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communications;
