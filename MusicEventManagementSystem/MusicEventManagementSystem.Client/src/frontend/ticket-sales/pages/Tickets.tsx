import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, QrCode, ArrowUp, ArrowDown, CheckCircle, Clock, XCircle } from "lucide-react";
import { TicketService } from "../services/ticketService";
import type { TicketResponse } from "../types/api/ticket";
import type { TicketCreateForm, TicketUpdateForm } from "../types/forms/ticket";
import { TicketStatus } from "../types/enums/ticketSales";

const Tickets = () => {
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketResponse | null>(null);
  const [formData, setFormData] = useState<Omit<TicketCreateForm, 'ticketTypeId'>>({
    uniqueCode: '',
    qrCode: '',
    issueDate: new Date(),
    finalPrice: 0,
    status: TicketStatus.Available,
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await TicketService.getAllTickets();
      setTickets(data);
    } catch (err) {
      setError('Failed to fetch tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTicket) {
        const updateData: TicketUpdateForm = {
          uniqueCode: formData.uniqueCode,
          qrCode: formData.qrCode,
          issueDate: formData.issueDate,
          finalPrice: formData.finalPrice,
          status: formData.status,
        };
        const updated = await TicketService.updateTicket(editingTicket.ticketId, updateData);
        setTickets(prev => 
          prev.map(item => item.ticketId === updated.ticketId ? updated : item)
        );
      } else {
        // For creating new tickets, you'll need to provide ticketTypeId
        // This should come from your form or be selected by the user
        const createData: TicketCreateForm = {
          ...formData,
          ticketTypeId: 1, // You'll need to make this dynamic based on your requirements
        };
        const created = await TicketService.createTicket(createData);
        setTickets(prev => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError('Failed to save ticket');
      console.error(err);
    }
  };

  const handleEdit = (ticket: TicketResponse) => {
    setEditingTicket(ticket);
    setFormData({
      uniqueCode: ticket.uniqueCode || '',
      qrCode: ticket.qrCode || '',
      issueDate: ticket.issueDate,
      finalPrice: ticket.finalPrice,
      status: ticket.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await TicketService.deleteTicket(id);
        setTickets(prev => prev.filter(item => item.ticketId !== id));
      } catch (err) {
        setError('Failed to delete ticket');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      uniqueCode: '',
      qrCode: '',
      issueDate: new Date(),
      finalPrice: 0,
      status: TicketStatus.Available,
    });
    setEditingTicket(null);
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

  const getStatusName = (status: TicketStatus): string => {
    switch (status) {
      case TicketStatus.Available: return 'Available';
      case TicketStatus.Reserved: return 'Reserved';
      case TicketStatus.Sold: return 'Sold';
      case TicketStatus.Used: return 'Used';
      case TicketStatus.Cancelled: return 'Cancelled';
      case TicketStatus.Expired: return 'Expired';
      case TicketStatus.Refunded: return 'Refunded';
      default: return 'Unknown';
    }
  };

  const stats = [
    {
      title: "Sold Tickets",
      value: tickets.filter(t => t.status === TicketStatus.Sold).length.toString(),
      change: "+15.2%",
      trend: "up",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "lime"
    },
    {
      title: "Used Tickets",
      value: tickets.filter(t => t.status === TicketStatus.Used).length.toString(),
      change: "+8.7%",
      trend: "up",
      icon: <Clock className="w-5 h-5" />,
      color: "blue"
    },
    {
      title: "Cancelled",
      value: tickets.filter(t => t.status === TicketStatus.Cancelled).length.toString(),
      change: "-2.1%",
      trend: "down",
      icon: <XCircle className="w-5 h-5" />,
      color: "purple"
    },
    {
      title: "Total Revenue",
      value: formatPrice(tickets.filter(t => t.status === TicketStatus.Sold || t.status === TicketStatus.Used).reduce((sum, ticket) => sum + ticket.finalPrice, 0)),
      change: "+12.3%",
      trend: "up",
      icon: <QrCode className="w-5 h-5" />,
      color: "orange"
    },
  ];

  if (loading) return <div className="text-center py-8 text-white">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-400">{error}</div>;

  return (
    <div className="text-white h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-1">Tickets</h1>
        <p className="text-neutral-400 text-sm">
          Manage individual tickets and track their status.
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
          <h2 className="text-xl font-bold text-white">All Tickets</h2>
          <p className="text-neutral-400 text-sm">Create and manage tickets</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400"
        >
          <Plus className="w-4 h-4" />
          Add Ticket
        </button>
      </div>

      {/* Tickets Table */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl hover:border-lime-400/30 transition-all duration-200 flex-1 min-h-0 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead className="border-b border-neutral-700">
              <tr>
                <th className="text-left p-4 pl-10 text-neutral-300 font-semibold">ID</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Unique Code</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Issue Date</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Final Price</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Status</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">QR Code</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.ticketId} className="border-b border-neutral-700/50 hover:bg-neutral-700/30 transition-all duration-200">
                  <td className="p-4 pl-10 text-white font-semibold">{ticket.ticketId}</td>
                  <td className="p-4 font-mono text-sm text-neutral-300">{ticket.uniqueCode || 'N/A'}</td>
                  <td className="p-4 text-neutral-300">{formatDate(ticket.issueDate)}</td>
                  <td className="p-4 font-semibold text-lime-400">{formatPrice(ticket.finalPrice)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      ticket.status === TicketStatus.Available ? 'bg-green-950/50 text-green-400 border-green-900/50' :
                      ticket.status === TicketStatus.Sold ? 'bg-lime-950/50 text-lime-400 border-lime-900/50' :
                      ticket.status === TicketStatus.Used ? 'bg-blue-950/50 text-blue-400 border-blue-900/50' :
                      ticket.status === TicketStatus.Cancelled ? 'bg-red-950/50 text-red-400 border-red-900/50' :
                      ticket.status === TicketStatus.Reserved ? 'bg-yellow-950/50 text-yellow-400 border-yellow-900/50' :
                      ticket.status === TicketStatus.Expired ? 'bg-gray-950/50 text-gray-400 border-gray-900/50' :
                      ticket.status === TicketStatus.Refunded ? 'bg-purple-950/50 text-purple-400 border-purple-900/50' :
                      'bg-orange-950/50 text-orange-400 border-orange-900/50'
                    }`}>
                      {getStatusName(ticket.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    {ticket.qrCode ? (
                      <QrCode className="w-5 h-5 text-lime-400" />
                    ) : (
                      <span className="text-neutral-500">None</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(ticket)}
                        className="p-1.5 hover:bg-neutral-600 rounded-lg transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.ticketId)}
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

        {tickets.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            <p>No tickets found. Create your first ticket!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingTicket ? 'Edit Ticket' : 'Add New Ticket'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Unique Code</label>
                <input
                  type="text"
                  value={formData.uniqueCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, uniqueCode: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all font-mono"
                  placeholder="Enter unique code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">QR Code</label>
                <input
                  type="text"
                  value={formData.qrCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, qrCode: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter QR code data"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Issue Date</label>
                <input
                  type="datetime-local"
                  value={new Date(formData.issueDate).toISOString().slice(0, 16)}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDate: new Date(e.target.value) }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Final Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.finalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, finalPrice: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter final price"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: parseInt(e.target.value) as TicketStatus }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                >
                  <option value={TicketStatus.Available}>Available</option>
                  <option value={TicketStatus.Reserved}>Reserved</option>
                  <option value={TicketStatus.Sold}>Sold</option>
                  <option value={TicketStatus.Used}>Used</option>
                  <option value={TicketStatus.Cancelled}>Cancelled</option>
                  <option value={TicketStatus.Expired}>Expired</option>
                  <option value={TicketStatus.Refunded}>Refunded</option>
                </select>
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
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 rounded-xl transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400"
                >
                  {editingTicket ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;