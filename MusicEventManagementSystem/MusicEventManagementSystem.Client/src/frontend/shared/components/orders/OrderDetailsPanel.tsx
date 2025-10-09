import { ArrowLeft, Loader2, CreditCard, XCircle } from "lucide-react";
import { Card } from "../../../ticket-sales/components/ui/card";
import { TicketCard } from "./TicketCard";
import { OrderSummary } from "./OrderSummary";
import type { OrderDetailsDto } from "../../../shared/types/api/order";
import type { JSX } from "react";

interface OrderDetailsPanelProps {
  isOpen: boolean;
  order: OrderDetailsDto | null;
  loading: boolean;
  onClose: () => void;
  onCancelOrder: (orderId: number) => void;
  onDownloadTicket: (ticketId: number) => void;
  getStatusIcon: (status: string) => JSX.Element;
  getStatusColor: (status: string) => string;
  formatDateTime: (dateString?: string) => string;
  formatCurrency: (amount: number) => string;
}

export const OrderDetailsPanel = ({
  isOpen,
  order,
  loading,
  onClose,
  onCancelOrder,
  onDownloadTicket,
  getStatusIcon,
  getStatusColor,
  formatDateTime,
  formatCurrency
}: OrderDetailsPanelProps) => {
  if (!isOpen) return null;

  return (
    <div className="w-1/3 transition-all duration-300">
      <Card className="overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900/60 backdrop-blur-sm h-full">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-orange-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold text-orange-400">
            Order Details
          </h2>
          <div className="w-5"></div>
        </div>

        <div className="space-y-6 overflow-y-auto px-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-4" />
              <p className="text-neutral-400">Loading order details...</p>
            </div>
          ) : order ? (
            <>
              {/* Order Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Order Information</h3>
                <div className="grid grid-cols-1 gap-3">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-neutral-400 text-sm mb-1">Status</p>
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor(order.status || '')}`}>
                          {getStatusIcon(order.status || '')}
                          {order.status || 'Unknown'}
                        </div>
                      </div>
                      <div>
                        <p className="text-neutral-400 text-sm mb-1">Order Date</p>
                        <p className="text-white text-sm">{formatDateTime(order.orderDate)}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <p className="text-neutral-400 text-sm mb-1">Payment Method</p>
                    <p className="text-white font-medium flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-orange-400" />
                      {order.paymentMethod || 'N/A'}
                    </p>
                  </Card>
                </div>
              </div>

              {/* Tickets */}
              {order.tickets && order.tickets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Your Tickets</h3>
                  <div className="space-y-4">
                    {order.tickets.map((ticket) => (
                      <TicketCard
                        key={ticket.ticketId}
                        ticket={ticket}
                        onDownload={onDownloadTicket}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                        formatDateTime={formatDateTime}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <OrderSummary order={order} formatCurrency={formatCurrency} />

              {/* Action Buttons */}
              {order.status?.toLowerCase() === 'confirmed' && (
                <div className="flex gap-3 pt-4 border-t border-neutral-800">
                  <button
                    onClick={() => onCancelOrder(order.orderId)}
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
  );
};