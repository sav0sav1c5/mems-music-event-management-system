import { KpiCard } from "../components/card";
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, CreditCard, DollarSign, ArrowUp, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { RecordedSaleService } from "../services/recordedSaleService";
import type { RecordedSaleResponse } from "../types/api/recordedSale";
import type { RecordedSaleCreateForm, RecordedSaleUpdateForm } from "../types/forms/recordedSale";
import { PaymentMethod, TransactionStatus } from "../types/enums/TicketSales";

const RecordedSales = () => {
  const [recordedSales, setRecordedSales] = useState<RecordedSaleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingSale, setEditingSale] = useState<RecordedSaleResponse | null>(null);
  const [formData, setFormData] = useState<Omit<RecordedSaleCreateForm, 'applicationUserId'>>({
    totalAmount: 0,
    paymentMethod: PaymentMethod.CreditCard,
    saleDate: new Date(),
    transactionStatus: TransactionStatus.Pending,
  });

  useEffect(() => {
    fetchRecordedSales();
  }, []);

  const fetchRecordedSales = async () => {
    try {
      setLoading(true);
      const data = await RecordedSaleService.getAllRecordedSales();
      setRecordedSales(data);
    } catch (err) {
      setError('Failed to fetch recorded sales');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSale) {
        const updateData: RecordedSaleUpdateForm = {
          totalAmount: formData.totalAmount,
          paymentMethod: formData.paymentMethod,
          saleDate: formData.saleDate,
          transactionStatus: formData.transactionStatus,
        };
        const updated = await RecordedSaleService.updateRecordedSale(editingSale.recordedSaleId, updateData);
        setRecordedSales(prev => 
          prev.map(item => item.recordedSaleId === updated.recordedSaleId ? updated : item)
        );
      } else {
        // For creating new sales, you'll need to provide applicationUserId
        // This should come from authentication context or user session
        const createData: RecordedSaleCreateForm = {
          ...formData,
          applicationUserId: 'default-user-id', // You'll need to make this dynamic
        };
        const created = await RecordedSaleService.createRecordedSale(createData);
        setRecordedSales(prev => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError('Failed to save recorded sale');
      console.error(err);
    }
  };

  const handleEdit = (sale: RecordedSaleResponse) => {
    setEditingSale(sale);
    setFormData({
      totalAmount: sale.totalAmount,
      paymentMethod: sale.paymentMethod,
      saleDate: sale.saleDate,
      transactionStatus: sale.transactionStatus,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this recorded sale?')) {
      try {
        await RecordedSaleService.deleteRecordedSale(id);
        setRecordedSales(prev => prev.filter(item => item.recordedSaleId !== id));
      } catch (err) {
        setError('Failed to delete recorded sale');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      totalAmount: 0,
      paymentMethod: PaymentMethod.CreditCard,
      saleDate: new Date(),
      transactionStatus: TransactionStatus.Pending,
    });
    setEditingSale(null);
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

  const getTotalRevenue = () => {
    return recordedSales
      .filter(sale => sale.transactionStatus === TransactionStatus.Completed)
      .reduce((sum, sale) => sum + sale.totalAmount, 0);
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

  const totalItems = recordedSales.length;
  const currentItems = recordedSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset current page to 1 when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.Cash:
        return <DollarSign className="w-4 h-4" />;
      case PaymentMethod.CreditCard:
      case PaymentMethod.DebitCard:
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const stats = [
    {
      title: "Total Revenue",
      value: `$${getTotalRevenue().toLocaleString()}`,
      change: 12.5,
      trend: "up" as const,
      icon: DollarSign,
      color: "lime" as const
    },
    {
      title: "Total Sales",
      value: recordedSales.length.toString(),
      change: 8.2,
      trend: "up" as const,
      icon: CreditCard,
      color: "blue" as const
    },
    {
      title: "Avg. Sale",
      value: `$${recordedSales.length > 0 ? (getTotalRevenue() / recordedSales.filter(s => s.transactionStatus === TransactionStatus.Completed).length || 0).toFixed(2) : '0.00'}`,
      change: 3.1,
      trend: "up" as const,
      icon: TrendingUp,
      color: "purple" as const
    },
    {
      title: "Completed",
      value: recordedSales.filter(s => s.transactionStatus === TransactionStatus.Completed).length.toString(),
      change: 5.1,
      trend: "up" as const,
      icon: ArrowUp,
      color: "orange" as const
    },
  ];

  if (loading) return <div className="text-center py-8 text-white">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-400">{error}</div>;

  return (
    <div className="text-white h-full flex flex-col p-2">
      {/* Header - Consistent Design */}


      <div className="flex justify-between items-center mb-4">
        <div className="">
          <h1 className="text-2xl font-bold text-white mb-1">Recorded Sales</h1>
          <p className="text-neutral-400 text-sm">
            Track all sales transactions and payment methods.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-lime-400 hover:bg-lime-500 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Sale
        </button>
      </div>

      {/* Stats Grid - Sada koristi KpiCard komponente */}
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

      {/* Sales Table - Consistent Design */}
      <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-all duration-200 flex-1 min-h-0 flex flex-col shadow-lg overflow-hidden">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead className="border-b border-neutral-800">
              <tr>
                <th className="text-center p-4 text-neutral-300 font-semibold text-sm w-auto">ID</th>
                <th className="text-center p-4 text-neutral-300 font-semibold text-sm w-auto">Amount</th>
                <th className="text-center p-4 text-neutral-300 font-semibold text-sm w-auto">Payment Method</th>
                <th className="text-center p-4 text-neutral-300 font-semibold text-sm w-auto">Sale Date</th>
                <th className="text-center p-4 text-neutral-300 font-semibold text-sm w-auto">Status</th>
                <th className="text-center p-4 text-neutral-300 font-semibold text-sm w-auto">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recordedSales.map((sale) => (
                <tr key={sale.recordedSaleId} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-all duration-200">
                  <td className="p-4 text-white font-semibold text-center">{sale.recordedSaleId}</td>
                  <td className="p-4 font-semibold text-lime-400 text-base text-center">{formatPrice(sale.totalAmount)}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center gap-2 text-neutral-300 justify-center">
                      {getPaymentMethodIcon(sale.paymentMethod)}
                      <span className="text-sm">{getPaymentMethodName(sale.paymentMethod)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-neutral-300 text-sm text-center">{formatDate(sale.saleDate)}</td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-3 py-1.5 rounded-xl text-sm font-medium border ${
                      sale.transactionStatus === TransactionStatus.Completed ? 'bg-lime-950/50 text-lime-400 border-lime-900/50' :
                      sale.transactionStatus === TransactionStatus.Pending ? 'bg-orange-950/50 text-orange-400 border-orange-900/50' :
                      sale.transactionStatus === TransactionStatus.Failed ? 'bg-red-950/50 text-red-400 border-red-900/50' :
                      sale.transactionStatus === TransactionStatus.Cancelled ? 'bg-purple-950/50 text-purple-400 border-purple-900/50' :
                      sale.transactionStatus === TransactionStatus.Refunded ? 'bg-blue-950/50 text-blue-400 border-blue-900/50' :
                      sale.transactionStatus === TransactionStatus.Processing ? 'bg-yellow-950/50 text-yellow-400 border-yellow-900/50' :
                      'bg-gray-950/50 text-gray-400 border-gray-900/50'
                    }`}>
                      {getTransactionStatusName(sale.transactionStatus)}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(sale)}
                        className="p-2 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sale.recordedSaleId)}
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
                // Prikazujemo samo prve 3 stranice, poslednje 3 i trenutnu sa +/- 1
                if (page <= 3 || page > Math.ceil(totalItems / itemsPerPage) - 3 || 
                    (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return true;
                }
                return false;
              })
              .map((page, index, array) => {
                // Dodajemo elipse između prekida u numeraciji
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
                {editingSale ? 'Edit Sale' : 'Record New Sale'}
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
                <label className="block text-sm font-medium mb-2 text-neutral-300">Total Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter total amount"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: parseInt(e.target.value) as PaymentMethod}))}
                  className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                >
                  <option value={PaymentMethod.CreditCard}>Credit Card</option>
                  <option value={PaymentMethod.DebitCard}>Debit Card</option>
                  <option value={PaymentMethod.Cash}>Cash</option>
                  <option value={PaymentMethod.BankTransfer}>Bank Transfer</option>
                  <option value={PaymentMethod.PayPal}>PayPal</option>
                  <option value={PaymentMethod.ApplePay}>Apple Pay</option>
                  <option value={PaymentMethod.GooglePay}>Google Pay</option>
                  <option value={PaymentMethod.Cryptocurrency}>Cryptocurrency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Sale Date</label>
                <input
                  type="datetime-local"
                  value={new Date(formData.saleDate).toISOString().slice(0, 16)}
                  onChange={(e) => setFormData(prev => ({ ...prev, saleDate: new Date(e.target.value) }))}
                  className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Transaction Status</label>
                <select
                  value={formData.transactionStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, transactionStatus: parseInt(e.target.value) as TransactionStatus }))}
                  className="w-full p-4 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                >
                  <option value={TransactionStatus.Pending}>Pending</option>
                  <option value={TransactionStatus.Completed}>Completed</option>
                  <option value={TransactionStatus.Failed}>Failed</option>
                  <option value={TransactionStatus.Cancelled}>Cancelled</option>
                  <option value={TransactionStatus.Refunded}>Refunded</option>
                  <option value={TransactionStatus.PartiallyRefunded}>Partially Refunded</option>
                  <option value={TransactionStatus.Processing}>Processing</option>
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
                  {editingSale ? 'Update' : 'Record Sale'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordedSales;