import { KpiCard } from "../components/card";
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, QrCode, CheckCircle, Clock, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { TicketService } from "../services/ticketService";
import type { TicketResponse } from "../types/api/ticket";
import type { TicketCreateForm, TicketUpdateForm } from "../types/forms/ticket";
import { TicketStatus } from "../types/enums/TicketSales";

const Tickets = () => {
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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
        const createData: TicketCreateForm = {
          ...formData,
          ticketTypeId: 1,
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const totalItems = tickets.length;
  const currentItems = tickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const stats = [
    {
      title: "Sold Tickets",
      value: tickets.filter(t => t.status === TicketStatus.Sold).length.toString(),
      change: 15.2,
      trend: "up" as const,
      icon: CheckCircle,
    },
    {
      title: "Used Tickets",
      value: tickets.filter(t => t.status === TicketStatus.Used).length.toString(),
      change: 8.7,
      trend: "up" as const,
      icon: Clock,
    },
    {
      title: "Cancelled",
      value: tickets.filter(t => t.status === TicketStatus.Cancelled).length.toString(),
      change: -2.1,
      trend: "down" as const,
      icon: XCircle,
    },
    {
      title: "Total Revenue",
      value: formatPrice(tickets.filter(t => t.status === TicketStatus.Sold || t.status === TicketStatus.Used).reduce((sum, ticket) => sum + ticket.finalPrice, 0)),
      change: 12.3,
      trend: "up" as const,
      icon: QrCode,
    },
  ];

  if (loading) return <div className="text-center py-8 text-white">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-400">{error}</div>;

  return (
    <div className="text-white h-full flex flex-col p-2">
      {/* Header - Consistent Design */}
      <div className="flex justify-between items-center mb-4">
        <div className="">
          <h1 className="text-2xl font-bold text-white mb-1">Tickets</h1>
          <p className="text-neutral-400 text-sm">
            Manage individual tickets and track their status.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-lime-400 hover:bg-lime-500 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Ticket
        </button>
      </div>

      {/* Stats Grid - Koristi KpiCard komponente */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.map((stat, index) => (
          <KpiCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType="percentage"
          />
        ))}
      </div>

      {/* Tickets Table - Consistent Design */}
      <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-all duration-200 flex-1 min-h-0 flex flex-col shadow-lg overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead className="border-b border-neutral-800">
              <tr>
                <th className="text-center p-4 text-neutral-300 font-semibold text-sm w-auto">ID</th>
                <th className="text-center p-4 text-neutral-300 font-semibold text-sm w-auto">Unique Code</th>
                <th className="text-center p-4 text-neutral-300 font-semibold text-sm w-auto">Issue Date</th>
                <th className="text-center p-4 text-neutral-300 font-semibold text-sm w-auto">Final Price</th>
                <th className="text-center p-4 text-neutral-300 font-semibold text-sm w-auto">Status</th>
                <th className="text-center p-4 text-neutral-300 font-semibold text-sm w-auto">QR Code</th>
                <th className="text-center p-4 text-neutral-300 font-semibold text-sm w-auto">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((ticket) => (
                <tr key={ticket.ticketId} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-all duration-200">
                  <td className="p-4 text-white font-semibold text-center">{ticket.ticketId}</td>
                  <td className="p-4 font-mono text-sm text-neutral-300 text-center">{ticket.uniqueCode || 'N/A'}</td>
                  <td className="p-4 text-neutral-300 text-sm text-center">{formatDate(ticket.issueDate)}</td>
                  <td className="p-4 font-semibold text-lime-400 text-base text-center">{formatPrice(ticket.finalPrice)}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-3 py-1.5 rounded-xl text-sm font-medium border ${
                      ticket.status === TicketStatus.Available ? 'bg-lime-950/50 text-lime-400 border-lime-900/50' :
                      ticket.status === TicketStatus.Sold ? 'bg-blue-950/50 text-blue-400 border-blue-900/50' :
                      ticket.status === TicketStatus.Used ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900/50' :
                      ticket.status === TicketStatus.Cancelled ? 'bg-red-950/50 text-red-400 border-red-900/50' :
                      ticket.status === TicketStatus.Reserved ? 'bg-yellow-950/50 text-yellow-400 border-yellow-900/50' :
                      ticket.status === TicketStatus.Expired ? 'bg-gray-950/50 text-gray-400 border-gray-900/50' :
                      ticket.status === TicketStatus.Refunded ? 'bg-purple-950/50 text-purple-400 border-purple-900/50' :
                      'bg-orange-950/50 text-orange-400 border-orange-900/50'
                    }`}>
                      {getStatusName(ticket.status)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {ticket.qrCode ? (
                      <div className="flex justify-center">
                        <QrCode className="w-5 h-5 text-lime-400" />
                      </div>
                    ) : (
                      <span className="text-neutral-500 text-sm">None</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(ticket)}
                        className="p-2 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ticket.ticketId)}
                        className="p-2 hover:bg-red-900/50 rounded-xl transition-all duration-200 text-neutral-400 hover:text-red-400 border border-transparent hover:border-red-400/30"
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

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-neutral-800 bg-neutral-900/50">
          <div className="text-sm text-neutral-400">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Page Numbers */}
            {Array.from({ length: Math.ceil(totalItems / itemsPerPage) }, (_, i) => i + 1)
              .filter(page => {
                if (page <= 3 || page > Math.ceil(totalItems / itemsPerPage) - 3 || 
                    (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return true;
                }
                return false;
              })
              .map((page, index, array) => {
                const showEllipsis = index > 0 && page - array[index - 1] > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && (
                      <span className="px-2 text-neutral-500">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-xl border transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-lime-500 border-lime-500 text-black font-semibold'
                          : 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
              className="p-2 rounded-xl border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Items per page selector */}
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <span>Show:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-neutral-800 border border-neutral-700 rounded-xl px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      </div>

      {/* Modal - Consistent Design */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-900/80 backdrop-blur-sm rounded-2xl p-6 w-full max-w-md border border-neutral-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingTicket ? 'Edit Ticket' : 'Add New Ticket'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Unique Code</label>
                <input
                  type="text"
                  value={formData.uniqueCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, uniqueCode: e.target.value }))}
                  className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all font-mono"
                  placeholder="Enter unique code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">QR Code</label>
                <input
                  type="text"
                  value={formData.qrCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, qrCode: e.target.value }))}
                  className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter QR code data"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Issue Date</label>
                <input
                  type="datetime-local"
                  value={new Date(formData.issueDate).toISOString().slice(0, 16)}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDate: new Date(e.target.value) }))}
                  className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Final Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.finalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, finalPrice: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter final price"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: parseInt(e.target.value) as TicketStatus }))}
                  className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
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

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 p-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 p-4 bg-lime-400 hover:bg-lime-500 rounded-xl transition-all duration-200 text-black font-semibold shadow-lg"
                >
                  {editingTicket ? 'Update' : 'Add Ticket'}
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