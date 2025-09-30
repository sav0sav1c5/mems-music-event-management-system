import { useState, useEffect } from "react";
import { Calendar, MapPin, Download, Eye, FileText, Search, CheckCircle, Clock, XCircle, ArrowLeft } from "lucide-react";
import { Card } from "../../ticket-sales/components/card";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
  orderDate: Date;
  status: 'completed' | 'pending' | 'cancelled';
  total: number;
  events: Array<{
    eventName: string;
    eventDate: Date;
    venue: string;
    ticketType: string;
    quantity: number;
    price: number;
  }>;
}

const OrderStatus = {
  completed: { label: "Completed", color: "text-green-400 bg-green-500/20", icon: CheckCircle },
  pending: { label: "Pending", color: "text-yellow-400 bg-yellow-500/20", icon: Clock },
  cancelled: { label: "Cancelled", color: "text-red-400 bg-red-500/20", icon: XCircle }
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Mock orders data
  const mockOrders: Order[] = [
    {
      id: "MEV-2024-001234",
      orderDate: new Date("2024-06-15"),
      status: "completed",
      total: 262.44,
      events: [
        {
          eventName: "Summer Rock Festival",
          eventDate: new Date("2024-07-15 20:00"),
          venue: "Belgrade Arena",
          ticketType: "General Admission",
          quantity: 2,
          price: 65
        },
        {
          eventName: "Jazz Night Live",
          eventDate: new Date("2024-06-20 19:30"),
          venue: "Novi Sad Music Hall",
          ticketType: "VIP Section",
          quantity: 1,
          price: 120
        }
      ]
    },
    {
      id: "MEV-2024-001189",
      orderDate: new Date("2024-05-28"),
      status: "completed",
      total: 180.50,
      events: [
        {
          eventName: "Electronic Beats",
          eventDate: new Date("2024-08-03 22:00"),
          venue: "Exit Festival Stage",
          ticketType: "Premium Access",
          quantity: 2,
          price: 85
        }
      ]
    },
    {
      id: "MEV-2024-001156",
      orderDate: new Date("2024-05-12"),
      status: "pending",
      total: 95.75,
      events: [
        {
          eventName: "Classical Evening",
          eventDate: new Date("2024-07-08 19:00"),
          venue: "National Theatre",
          ticketType: "Orchestra Seating",
          quantity: 1,
          price: 85
        }
      ]
    },
    {
      id: "MEV-2024-001098",
      orderDate: new Date("2024-04-22"),
      status: "cancelled",
      total: 150.00,
      events: [
        {
          eventName: "Pop Sensation Tour",
          eventDate: new Date("2024-06-30 20:30"),
          venue: "Stadium",
          ticketType: "Floor Seats",
          quantity: 2,
          price: 75
        }
      ]
    }
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.events.some(event => 
          event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.venue.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());

    setFilteredOrders(filtered);
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setSelectedOrder(null);
    setShowOrderModal(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, orders]);

  return (
    <div className="text-white h-full flex flex-col p-2">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200"
            >
              <ArrowLeft size={20} className="text-neutral-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">My Orders</h1>
              <p className="text-neutral-400 text-sm">View and manage your ticket orders</p>
            </div>
          </div>
          <div className="text-neutral-400 text-sm">
            {filteredOrders.length} orders found
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                placeholder="Search by order ID, event, or venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all text-base"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                statusFilter === "all"
                  ? "bg-orange-500 text-black"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                statusFilter === "completed"
                  ? "bg-orange-500 text-black"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                statusFilter === "pending"
                  ? "bg-orange-500 text-black"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      {loading ? (
        <Card className="flex items-center justify-center h-64">
          <div className="text-white text-base">Loading orders...</div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const StatusIcon = OrderStatus[order.status].icon;
            return (
              <Card key={order.id} hover={true} className="p-6">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/20 rounded-xl">
                      <FileText className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-lg">Order #{order.id}</h4>
                      <p className="text-neutral-400 text-sm">Placed on {formatDate(order.orderDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-xl flex items-center gap-2 font-medium ${OrderStatus[order.status].color}`}>
                      <StatusIcon size={14} />
                      {OrderStatus[order.status].label}
                    </span>
                    <span className="text-orange-400 text-lg font-bold">${order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Events Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {order.events.map((event, index) => (
                    <div key={index} className="bg-neutral-800/30 rounded-xl p-4">
                      <h4 className="text-white text-sm font-medium mb-2">{event.eventName}</h4>
                      <div className="space-y-1 text-xs text-neutral-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-orange-400" />
                          <span>{formatDateTime(event.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-orange-400" />
                          <span>{event.venue}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span>{event.ticketType} x{event.quantity}</span>
                          <span className="text-orange-400 font-medium">${(event.price * event.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
                  <div className="text-neutral-400 text-sm">
                    {order.events.length} event{order.events.length > 1 ? 's' : ''} • {order.events.reduce((sum, event) => sum + event.quantity, 0)} tickets
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openOrderModal(order)}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm transition-all duration-200 flex items-center gap-2"
                    >
                      <Eye size={14} />
                      View Details
                    </button>
                    {order.status === 'completed' && (
                      <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black rounded-xl text-sm transition-all duration-200 flex items-center gap-2 font-medium">
                        <Download size={14} />
                        Download Tickets
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {filteredOrders.length === 0 && !loading && (
        <Card className="text-center py-16">
          <div className="p-4 bg-neutral-800/50 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-neutral-400" />
          </div>
          <p className="text-neutral-400 text-base mb-2">No orders found</p>
          <p className="text-neutral-500 text-sm mb-6">Start by browsing events and purchasing tickets</p>
          <button 
            onClick={() => navigate("/client/events")}
            className="bg-orange-500 hover:bg-orange-600 text-black px-6 py-3 rounded-xl transition-all duration-200 font-medium"
          >
            Browse Events
          </button>
        </Card>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-xl">
                  <FileText className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Order Details</h2>
                  <p className="text-sm text-neutral-400">#{selectedOrder.id}</p>
                </div>
              </div>
              <button
                onClick={closeOrderModal}
                className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Order Status */}
              <div className="bg-neutral-800/30 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">Order Status</p>
                    <p className="text-neutral-400 text-sm">Placed on {formatDateTime(selectedOrder.orderDate)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-sm flex items-center gap-2 font-medium ${OrderStatus[selectedOrder.status].color}`}>
                    {(() => {
                      const StatusIcon = OrderStatus[selectedOrder.status].icon;
                      return <StatusIcon size={16} />;
                    })()}
                    {OrderStatus[selectedOrder.status].label}
                  </span>
                </div>
              </div>

              {/* Events Details */}
              <div>
                <h3 className="text-white font-medium mb-4">Event Details</h3>
                <div className="space-y-4">
                  {selectedOrder.events.map((event, index) => (
                    <div key={index} className="bg-neutral-800/30 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-white font-medium">{event.eventName}</h4>
                          <p className="text-neutral-400 text-sm">{event.ticketType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-orange-400 font-medium">${(event.price * event.quantity).toLocaleString()}</p>
                          <p className="text-neutral-400 text-sm">${event.price} x {event.quantity}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-neutral-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          <span>{formatDateTime(event.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-orange-400" />
                          <span>{event.venue}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-neutral-800/30 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Total Amount</span>
                  <span className="text-orange-400 text-xl font-bold">${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedOrder.status === 'completed' && (
                  <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-black py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium">
                    <Download size={16} />
                    Download All Tickets
                  </button>
                )}
                <button
                  onClick={closeOrderModal}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;