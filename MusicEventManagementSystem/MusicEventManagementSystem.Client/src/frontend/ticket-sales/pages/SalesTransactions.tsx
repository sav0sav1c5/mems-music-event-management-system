import { KpiCard } from "../components/card";
import React, { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash2, X, CreditCard, DollarSign, TrendingUp, 
  Ticket, CheckCircle, Clock, XCircle, Filter, ChevronLeft, 
  ChevronRight, Users, BarChart3 
} from "lucide-react";
import { RecordedSaleService } from "../services/recordedSaleService";
import { TicketService } from "../services/ticketService";
import type { RecordedSaleResponse } from "../types/api/recordedSale";
import type { TicketResponse } from "../types/api/ticket";
import { PaymentMethod, TransactionStatus, TicketStatus } from "../types/enums/TicketSales";

const SalesTransactions = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [recordedSales, setRecordedSales] = useState<RecordedSaleResponse[]>([]);
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesData, ticketsData] = await Promise.all([
        RecordedSaleService.getAllRecordedSales(),
        TicketService.getAllTickets()
      ]);
      setRecordedSales(salesData);
      setTickets(ticketsData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
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

  const getPaymentMethodName = (method: PaymentMethod): string => {
    switch (method) {
      case PaymentMethod.CreditCard: return 'Credit Card';
      case PaymentMethod.DebitCard: return 'Debit Card';
      case PaymentMethod.Cash: return 'Cash';
      case PaymentMethod.BankTransfer: return 'Bank Transfer';
      case PaymentMethod.PayPal: return 'PayPal';
      case PaymentMethod.ApplePay: return 'Apple Pay';
      case PaymentMethod.GooglePay: return 'Google Pay';
      case PaymentMethod.Cryptocurrency: return 'Cryptocurrency';
      default: return 'Unknown';
    }
  };

  const getTransactionStatusName = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.Pending: return 'Pending';
      case TransactionStatus.Completed: return 'Completed';
      case TransactionStatus.Failed: return 'Failed';
      case TransactionStatus.Cancelled: return 'Cancelled';
      case TransactionStatus.Refunded: return 'Refunded';
      case TransactionStatus.PartiallyRefunded: return 'Partially Refunded';
      case TransactionStatus.Processing: return 'Processing';
      default: return 'Unknown';
    }
  };

  const getTicketStatusName = (status: TicketStatus): string => {
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

  // Stats calculations
  const totalRevenue = recordedSales
    .filter(sale => sale.transactionStatus === TransactionStatus.Completed)
    .reduce((sum, sale) => sum + sale.totalAmount, 0);

  const totalTransactions = recordedSales.length;
  const completedTransactions = recordedSales.filter(s => s.transactionStatus === TransactionStatus.Completed).length;
  const soldTickets = tickets.filter(t => t.status === TicketStatus.Sold || t.status === TicketStatus.Used).length;

  const stats = [
    {
      title: "Total Revenue",
      value: formatPrice(totalRevenue),
      change: 12.5,
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      title: "Transactions",
      value: totalTransactions.toString(),
      change: 8.2,
      trend: "up" as const,
      icon: CreditCard,
    },
    {
      title: "Completed",
      value: completedTransactions.toString(),
      change: 5.1,
      trend: "up" as const,
      icon: CheckCircle,
    },
    {
      title: "Tickets Sold",
      value: soldTickets.toString(),
      change: 15.3,
      trend: "up" as const,
      icon: Ticket,
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Sales Overview', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'inventory', label: 'Ticket Inventory', icon: Ticket }
  ];

  const filteredSales = recordedSales.filter(sale =>
    sale.recordedSaleId.toString().includes(searchTerm) ||
    getPaymentMethodName(sale.paymentMethod).toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatPrice(sale.totalAmount).includes(searchTerm)
  );

  const filteredTickets = tickets.filter(ticket =>
    ticket.ticketId.toString().includes(searchTerm) ||
    ticket.uniqueCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getTicketStatusName(ticket.status).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  if (loading) return <div className="text-center py-8 text-white">Loading...</div>;

  return (
    <div className="text-white h-full flex flex-col p-2">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Sales & Transactions</h1>
            <p className="text-neutral-400 text-sm">Manage sales transactions and ticket inventory</p>
          </div>
          <button className="bg-lime-400 hover:bg-lime-500 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold shadow-lg">
            <Plus size={16} />
            New Transaction
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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

      {/* Tabs */}
      <div className="space-y-4 mb-4">
        <div className="flex space-x-1 rounded-2xl bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 p-1 shadow-lg">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-lime-400 text-black shadow-lg font-medium'
                    : 'text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Bar
      <div className="mb-4">
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'transactions' ? 'transactions' : 'tickets'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-base"
          />
        </div>
      </div> */}

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Transactions</h3>
              <div className="space-y-4">
                {recordedSales.slice(0, 5).map((sale) => (
                  <div key={sale.recordedSaleId} className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-2xl">
                    <div>
                      <div className="text-white font-medium">Sale #{sale.recordedSaleId}</div>
                      <div className="text-neutral-400 text-sm">{getPaymentMethodName(sale.paymentMethod)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lime-400 font-semibold">{formatPrice(sale.totalAmount)}</div>
                      <div className="text-neutral-400 text-sm">{formatDate(sale.saleDate)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Status Summary */}
            <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Ticket Status</h3>
              <div className="space-y-3">
                {Object.values(TicketStatus).map((status) => {
                  const count = tickets.filter(t => t.status === status).length;
                  const percentage = tickets.length > 0 ? (count / tickets.length) * 100 : 0;
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status === TicketStatus.Sold ? 'bg-lime-500' :
                          status === TicketStatus.Available ? 'bg-blue-500' :
                          status === TicketStatus.Used ? 'bg-emerald-500' :
                          'bg-neutral-500'
                        }`}></div>
                        <span className="text-neutral-300 text-sm">{getTicketStatusName(status)}</span>
                      </div>
                      <div className="text-white text-sm font-medium">
                        {count} <span className="text-neutral-400 text-xs">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-all duration-200 flex-1 min-h-0 flex flex-col shadow-lg overflow-hidden">
            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead className="border-b border-neutral-800">
                  <tr>
                    <th className="text-center p-4 text-neutral-300 font-semibold text-sm">ID</th>
                    <th className="text-center p-4 text-neutral-300 font-semibold text-sm">Amount</th>
                    <th className="text-center p-4 text-neutral-300 font-semibold text-sm">Payment Method</th>
                    <th className="text-center p-4 text-neutral-300 font-semibold text-sm">Date</th>
                    <th className="text-center p-4 text-neutral-300 font-semibold text-sm">Status</th>
                    <th className="text-center p-4 text-neutral-300 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSales.map((sale) => (
                    <tr key={sale.recordedSaleId} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-all duration-200">
                      <td className="p-4 text-white font-semibold text-center">{sale.recordedSaleId}</td>
                      <td className="p-4 font-semibold text-lime-400 text-base text-center">{formatPrice(sale.totalAmount)}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center gap-2 text-neutral-300 justify-center">
                          <CreditCard className="w-4 h-4" />
                          <span className="text-sm">{getPaymentMethodName(sale.paymentMethod)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-neutral-300 text-sm text-center">{formatDate(sale.saleDate)}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex px-3 py-1.5 rounded-xl text-sm font-medium border ${
                          sale.transactionStatus === TransactionStatus.Completed ? 'bg-lime-950/50 text-lime-400 border-lime-900/50' :
                          sale.transactionStatus === TransactionStatus.Pending ? 'bg-orange-950/50 text-orange-400 border-orange-900/50' :
                          sale.transactionStatus === TransactionStatus.Failed ? 'bg-red-950/50 text-red-400 border-red-900/50' :
                          'bg-gray-950/50 text-gray-400 border-gray-900/50'
                        }`}>
                          {getTransactionStatusName(sale.transactionStatus)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button className="p-2 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-red-900/50 rounded-xl transition-all duration-200 text-neutral-400 hover:text-red-400 border border-transparent hover:border-red-400/30">
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSales.length)} of {filteredSales.length} results
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: Math.ceil(filteredSales.length / itemsPerPage) }, (_, i) => i + 1)
                  .filter(page => page <= 3 || page > Math.ceil(filteredSales.length / itemsPerPage) - 3 || (page >= currentPage - 1 && page <= currentPage + 1))
                  .map((page, index, array) => {
                    const showEllipsis = index > 0 && page - array[index - 1] > 1;
                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="px-2 text-neutral-500">...</span>}
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
                  disabled={currentPage === Math.ceil(filteredSales.length / itemsPerPage)}
                  className="p-2 rounded-xl border border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

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
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-all duration-200 flex-1 min-h-0 flex flex-col shadow-lg overflow-hidden">
            <div className="overflow-x-auto flex-1">
              <table className="w-full">
                <thead className="border-b border-neutral-800">
                  <tr>
                    <th className="text-center p-4 text-neutral-300 font-semibold text-sm">ID</th>
                    <th className="text-center p-4 text-neutral-300 font-semibold text-sm">Unique Code</th>
                    <th className="text-center p-4 text-neutral-300 font-semibold text-sm">Issue Date</th>
                    <th className="text-center p-4 text-neutral-300 font-semibold text-sm">Final Price</th>
                    <th className="text-center p-4 text-neutral-300 font-semibold text-sm">Status</th>
                    <th className="text-center p-4 text-neutral-300 font-semibold text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.slice(0, itemsPerPage).map((ticket) => (
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
                          'bg-gray-950/50 text-gray-400 border-gray-900/50'
                        }`}>
                          {getTicketStatusName(ticket.status)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button className="p-2 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-red-900/50 rounded-xl transition-all duration-200 text-neutral-400 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesTransactions;