import { useState, useEffect } from "react";
import { Calendar, MapPin, Ticket, Download, QrCode, Clock, CheckCircle, XCircle, ArrowLeft, Loader2, CreditCard } from "lucide-react";
import { Card } from "../../ticket-sales/components/ui/card";
import { OrdersService } from "../../shared/services/client/ordersService";
import type { OrderDto, OrderDetailsDto } from "../../shared/types/api/order";
import { useAuth } from "../contexts/AuthContext";

const MyOrders = () => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailsDto | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const { userId, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchOrders();
    }
  }, [isAuthenticated, userId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await OrdersService.getUserOrders(userId);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      setOrderLoading(true);
      const orderDetails = await OrdersService.getOrderDetails(userId, orderId);
      setSelectedOrder(orderDetails);
      setShowOrderDetails(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleViewTickets = async (order: OrderDto) => {
    await fetchOrderDetails(order.orderId);
  };

  const handleDownloadTicket = async (ticketId: number) => {
    try {
      const blob = await OrdersService.downloadTicketPdf(userId, ticketId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${ticketId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading ticket:", error);
      alert("Failed to download ticket. Please try again.");
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      return;
    }

    try {
      await OrdersService.cancelOrder(userId, orderId);
      alert("Order cancelled successfully");
      await fetchOrders();
      setShowOrderDetails(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Please try again.");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-400" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
        <div className="text-white h-full flex flex-col p-4 m-1">
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <p className="text-neutral-400 text-base">Please log in to view your orders</p>
              <button 
                onClick={() => window.location.href = "/login"}
                className="px-6 py-3 rounded-xl bg-orange-400 text-black font-medium hover:bg-orange-500 transition-all duration-200 shadow-lg"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
        <div className="text-white h-full flex flex-col p-4 m-1">
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
              <p className="text-neutral-400 text-base">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
      <div className="text-white h-full flex flex-col p-4 m-1">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">My Orders</h1>
          <p className="text-neutral-400 text-sm">Manage your event tickets and orders</p>
        </div>

        {orders.length === 0 ? (
          /* Empty State */
          <Card className="text-center py-16">
            <div className="p-4 bg-neutral-800/50 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Ticket className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-400 text-base mb-2">No orders yet</p>
            <p className="text-neutral-500 text-sm mb-6">Browse events and purchase tickets to see them here</p>
            <button 
              onClick={() => window.location.href = "/client/events"}
              className="px-6 py-3 rounded-xl bg-orange-400 text-black font-medium hover:bg-orange-500 transition-all duration-200 shadow-lg"
            >
              Browse Events
            </button>
          </Card>
        ) : (
          <div className={`flex gap-6 transition-all duration-300 ${showOrderDetails ? 'overflow-hidden' : ''}`}>
            {/* Orders List - Left Side */}
            <div className={`flex-1 transition-all duration-300 ${showOrderDetails ? 'w-2/3' : 'w-full'}`}>
              <div className="space-y-4 overflow-y-auto">
                {orders.map((order) => (
                  <Card key={order.orderId} hover={true} className="p-6 group cursor-pointer" onClick={() => handleViewTickets(order)}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white text-lg font-medium mb-1 group-hover:text-orange-400 transition-colors">
                              Order #{order.orderId}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-neutral-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-orange-400" />
                                <span>{formatDateTime(order.orderDate)}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status || '')}`}>
                            {getStatusIcon(order.status || '')}
                            {order.status || 'Unknown'}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-neutral-400">Total Items</p>
                            <p className="text-white font-medium">{order.totalTickets || 0} tickets</p>
                          </div>
                          <div>
                            <p className="text-neutral-400">Payment Method</p>
                            <p className="text-white font-medium flex items-center gap-1">
                              <CreditCard className="w-4 h-4 text-orange-400" />
                              {order.paymentMethod || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-neutral-400">Total</p>
                            <p className="text-orange-400 text-lg font-bold">{formatCurrency(order.totalAmount || 0)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleViewTickets(order)}
                          className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-black font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
                        >
                          <QrCode size={16} />
                          View Details
                        </button>
                        {order.status?.toLowerCase() === 'confirmed' && (
                          <button
                            onClick={() => handleCancelOrder(order.orderId)}
                            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-neutral-700"
                          >
                            <XCircle size={16} />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Details Side Panel */}
            {showOrderDetails && (
              <div className="w-1/3 transition-all duration-300">
                <Card className="overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900/60 backdrop-blur-sm h-full">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
                    <button
                      onClick={() => {
                        setShowOrderDetails(false);
                        setSelectedOrder(null);
                      }}
                      className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-orange-400"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-orange-400">
                      Order Details
                    </h2>
                    <div className="w-5"></div> {/* Spacer for alignment */}
                  </div>

                  <div className="space-y-6 overflow-y-auto px-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {orderLoading ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-4" />
                        <p className="text-neutral-400">Loading order details...</p>
                      </div>
                    ) : selectedOrder ? (
                      <>
                        {/* Order Summary */}
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-4">Order Information</h3>
                          <div className="grid grid-cols-1 gap-3">
                            <Card className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-neutral-400 text-sm mb-1">Status</p>
                                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(selectedOrder.status || '')}`}>
                                    {getStatusIcon(selectedOrder.status || '')}
                                    {selectedOrder.status || 'Unknown'}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-neutral-400 text-sm mb-1">Order Date</p>
                                  <p className="text-white text-sm">{formatDateTime(selectedOrder.orderDate)}</p>
                                </div>
                              </div>
                            </Card>
                            <Card className="p-4">
                              <p className="text-neutral-400 text-sm mb-1">Payment Method</p>
                              <p className="text-white font-medium flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-orange-400" />
                                {selectedOrder.paymentMethod || 'N/A'}
                              </p>
                            </Card>
                          </div>
                        </div>

                        {/* Tickets */}
                        {selectedOrder.tickets && selectedOrder.tickets.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Your Tickets</h3>
                            <div className="space-y-4">
                              {selectedOrder.tickets.map((ticket) => (
                                <Card key={ticket.ticketId} hover={true} className="p-4">
                                  <div className="flex items-start gap-3 mb-3">
                                    <div className="p-2 bg-orange-400/20 rounded-lg border border-orange-500/30">
                                      <Ticket className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="text-white font-medium">Ticket #{ticket.ticketId}</h4>
                                      <p className="text-neutral-400 text-sm">{ticket.eventName}</p>
                                      <p className="text-neutral-400 text-xs">{ticket.ticketTypeName}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2 text-sm mb-4">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-orange-400" />
                                      <span className="text-neutral-300">{formatDateTime(ticket.eventStartDate)}</span>
                                    </div>
                                    {ticket.zoneName && (
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-orange-400" />
                                        <span className="text-neutral-300">{ticket.zoneName}</span>
                                      </div>
                                    )}
                                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${getStatusColor(ticket.status || '')}`}>
                                      {getStatusIcon(ticket.status || '')}
                                      {ticket.status || 'Unknown'}
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-center gap-3">
                                    {/* QR Code Placeholder */}
                                      <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center border-2 border-orange-400 overflow-hidden">
                                        {ticket.qrCode ? (
                                          <img 
                                            src={`data:image/png;base64,${ticket.qrCode}`} 
                                            alt="QR Code" 
                                            className="w-full h-full object-contain"
                                          />
                                        ) : (
                                          <div className="text-center">
                                            <QrCode className="w-8 h-8 text-black mx-auto mb-1" />
                                            <span className="text-black text-xs font-medium">QR CODE</span>
                                          </div>
                                        )}
                                      </div>
                                    <button 
                                      onClick={() => handleDownloadTicket(ticket.ticketId)}
                                      className="text-orange-400 hover:text-orange-300 text-sm transition-colors flex items-center gap-1 font-medium"
                                    >
                                      <Download size={14} />
                                      Download PDF
                                    </button>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Price Breakdown */}
                        <div className="border-t border-neutral-800 pt-6">
                          <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>
                          <Card className="p-4">
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Subtotal</span>
                                <span className="text-white">{formatCurrency(selectedOrder.subtotal || 0)}</span>
                              </div>
                              {(selectedOrder.discount || 0) > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-green-400">Discount</span>
                                  <span className="text-green-400">-{formatCurrency(selectedOrder.discount || 0)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Service Fee</span>
                                <span className="text-white">{formatCurrency(selectedOrder.serviceFee || 0)}</span>
                              </div>
                              <div className="flex justify-between text-lg font-semibold border-t border-neutral-700 pt-3">
                                <span className="text-white">Total</span>
                                <span className="text-orange-400">{formatCurrency(selectedOrder.totalAmount || 0)}</span>
                              </div>
                            </div>
                          </Card>
                        </div>

                        {/* Action Buttons */}
                        {selectedOrder.status?.toLowerCase() === 'confirmed' && (
                          <div className="flex gap-3 pt-4 border-t border-neutral-800">
                            <button
                              onClick={() => handleCancelOrder(selectedOrder.orderId)}
                              className="flex-1 p-3 bg-red-500/10 border border-red-500/30 text-red-400 font-medium rounded-xl hover:bg-red-500/20 transition-all duration-200 flex items-center justify-center gap-2"
                            >
                              <XCircle size={16} />
                              Cancel Order
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-8 text-neutral-400">
                        <p>No order details available</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;