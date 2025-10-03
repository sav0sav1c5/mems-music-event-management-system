// MyOrders.tsx - Client verzija
import { useState } from "react";
import { Calendar, MapPin, Ticket, Download, Eye, QrCode, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card } from "../../ticket-sales/components/ui/card";

interface Order {
  id: string;
  eventName: string;
  eventDate: string;
  venue: string;
  ticketType: string;
  quantity: number;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  orderDate: string;
  tickets: Array<{
    id: string;
    seat?: string;
    qrCode: string;
  }>;
}

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "MEV-2024-001234",
      eventName: "Summer Rock Festival",
      eventDate: "2024-07-15 20:00",
      venue: "Belgrade Arena",
      ticketType: "General Admission",
      quantity: 2,
      totalPrice: 130,
      status: 'confirmed',
      orderDate: "2024-01-15 14:30",
      tickets: [
        { id: "T001", qrCode: "qr-summer-001" },
        { id: "T002", qrCode: "qr-summer-002" }
      ]
    },
    {
      id: "MEV-2024-001235",
      eventName: "Jazz Night Live",
      eventDate: "2024-06-20 19:30",
      venue: "Novi Sad Music Hall",
      ticketType: "VIP Section",
      quantity: 1,
      totalPrice: 120,
      status: 'confirmed',
      orderDate: "2024-01-10 11:15",
      tickets: [
        { id: "T003", seat: "A12", qrCode: "qr-jazz-001" }
      ]
    },
    {
      id: "MEV-2024-001236",
      eventName: "Electronic Beats Festival",
      eventDate: "2024-08-05 22:00",
      venue: "Belgrade Fortress",
      ticketType: "Premium Access",
      quantity: 1,
      totalPrice: 85,
      status: 'pending',
      orderDate: "2024-01-18 09:45",
      tickets: [
        { id: "T004", qrCode: "qr-electronic-001" }
      ]
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-400" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'pending':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'cancelled':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadTickets = (order: Order) => {
    // Mock download functionality
    alert(`Downloading tickets for ${order.eventName}`);
  };

  const handleViewTickets = (order: Order) => {
    setSelectedOrder(order);
  };

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
      <div className="text-white h-full flex flex-col p-4 m-1">
        {/* Header */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">My Orders</h1>
              <p className="text-neutral-400 text-sm">Manage your event tickets and orders</p>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} hover={true} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white text-lg font-medium mb-1">{order.eventName}</h3>
                      <div className="flex items-center gap-4 text-sm text-neutral-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          <span>{formatDateTime(order.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-orange-400" />
                          <span>{order.venue}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-400">Order ID</p>
                      <p className="text-white font-medium">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Tickets</p>
                      <p className="text-white font-medium">
                        {order.quantity} × {order.ticketType}
                      </p>
                    </div>
                    <div>
                      <p className="text-neutral-400">Total</p>
                      <p className="text-orange-400 text-lg font-bold">${order.totalPrice}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleViewTickets(order)}
                    className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-black font-medium rounded-xl transition-all duration-200 flex items-center gap-2"
                  >
                    <QrCode size={16} />
                    View Tickets
                  </button>
                  <button
                    onClick={() => handleDownloadTickets(order)}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-all duration-200 flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Ticket Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Your Tickets - {selectedOrder.eventName}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200"
                >
                  <XCircle className="w-6 h-6 text-neutral-400" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedOrder.tickets.map((ticket, index) => (
                  <div key={ticket.id} className="bg-neutral-800/30 rounded-xl p-6 border border-neutral-700">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-orange-400/20 rounded-xl">
                            <Ticket className="w-6 h-6 text-orange-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium">Ticket #{ticket.id}</h3>
                            <p className="text-neutral-400 text-sm">{selectedOrder.ticketType}</p>
                            {ticket.seat && (
                              <p className="text-neutral-400 text-sm">Seat: {ticket.seat}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-orange-400" />
                            <span className="text-neutral-300">{formatDateTime(selectedOrder.eventDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-400" />
                            <span className="text-neutral-300">{selectedOrder.venue}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        {/* QR Code Placeholder */}
                        <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center border-2 border-orange-400">
                          <div className="text-center">
                            <QrCode className="w-12 h-12 text-black mx-auto mb-2" />
                            <span className="text-black text-xs font-medium">QR CODE</span>
                          </div>
                        </div>
                        <button className="text-orange-400 hover:text-orange-300 text-sm transition-colors">
                          Download Ticket
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-neutral-700">
                <button
                  onClick={() => handleDownloadTickets(selectedOrder)}
                  className="px-6 py-3 bg-orange-400 hover:bg-orange-500 text-black font-medium rounded-xl transition-all duration-200 flex items-center gap-2"
                >
                  <Download size={16} />
                  Download All Tickets
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;