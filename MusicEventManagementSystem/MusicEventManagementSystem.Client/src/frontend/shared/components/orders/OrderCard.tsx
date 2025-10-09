import { Calendar, CreditCard, QrCode, XCircle } from "lucide-react";
import { Card } from "../../../ticket-sales/components/ui/card";
import type { OrderDto } from "../../../shared/types/api/order";
import type { JSX } from "react";

interface OrderCardProps {
  order: OrderDto;
  onViewTickets: (order: OrderDto) => void;
  onCancelOrder: (orderId: number) => void;
  getStatusIcon: (status: string) => JSX.Element;
  getStatusColor: (status: string) => string;
  formatDateTime: (dateString?: string) => string;
  formatCurrency: (amount: number) => string;
}

export const OrderCard = ({
  order,
  onViewTickets,
  onCancelOrder,
  getStatusIcon,
  getStatusColor,
  formatDateTime,
  formatCurrency
}: OrderCardProps) => {
  return (
    <Card key={order.orderId} hover={true} className="p-6 group cursor-pointer" onClick={() => onViewTickets(order)}>
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
            onClick={() => onViewTickets(order)}
            className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-black font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <QrCode size={16} />
            View Details
          </button>
          {order.status?.toLowerCase() === 'confirmed' && (
            <button
              onClick={() => onCancelOrder(order.orderId)}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-neutral-700"
            >
              <XCircle size={16} />
              Cancel
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};