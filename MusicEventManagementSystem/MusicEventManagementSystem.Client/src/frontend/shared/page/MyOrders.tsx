import { useState, useEffect } from "react";
import { Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import { OrdersService } from "../../shared/services/client/ordersService";
import type { OrderDto, OrderDetailsDto } from "../../shared/types/api/order";
import { useAuth } from "../contexts/AuthContext";
import { OrdersHeader } from "../components/orders/OrdersHeader";
import { EmptyOrders } from "../components/orders/EmptyOrders";
import { OrdersList } from "../components/orders/OrdersList";
import { OrderDetailsPanel } from "../components/orders/OrderDetailsPanel";

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

  const handleBrowseEvents = () => {
    window.location.href = "/client/events";
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
        <OrdersHeader 
          title="My Orders" 
          subtitle="Manage your event tickets and orders" 
        />

        {orders.length === 0 ? (
          <EmptyOrders onBrowseEvents={handleBrowseEvents} />
        ) : (
          <div className={`flex gap-6 transition-all duration-300 ${showOrderDetails ? 'overflow-hidden' : ''}`}>
            {/* Orders List - Left Side */}
            <div className={`flex-1 transition-all duration-300 ${showOrderDetails ? 'w-2/3' : 'w-full'}`}>
              <OrdersList
                orders={orders}
                onViewTickets={handleViewTickets}
                onCancelOrder={handleCancelOrder}
                getStatusIcon={getStatusIcon}
                getStatusColor={getStatusColor}
                formatDateTime={formatDateTime}
                formatCurrency={formatCurrency}
              />
            </div>

            {/* Order Details Side Panel */}
            <OrderDetailsPanel
              isOpen={showOrderDetails}
              order={selectedOrder}
              loading={orderLoading}
              onClose={() => {
                setShowOrderDetails(false);
                setSelectedOrder(null);
              }}
              onCancelOrder={handleCancelOrder}
              onDownloadTicket={handleDownloadTicket}
              getStatusIcon={getStatusIcon}
              getStatusColor={getStatusColor}
              formatDateTime={formatDateTime}
              formatCurrency={formatCurrency}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;