import { OrderCard } from "./OrderCard";
import type { OrderDto } from "../../../shared/types/api/order";
import type { JSX } from "react";

interface OrdersListProps {
  orders: OrderDto[];
  onViewTickets: (order: OrderDto) => void;
  onCancelOrder: (orderId: number) => void;
  getStatusIcon: (status: string) => JSX.Element;
  getStatusColor: (status: string) => string;
  formatDateTime: (dateString?: string) => string;
  formatCurrency: (amount: number) => string;
}

export const OrdersList = ({
  orders,
  onViewTickets,
  onCancelOrder,
  getStatusIcon,
  getStatusColor,
  formatDateTime,
  formatCurrency
}: OrdersListProps) => {
  return (
    <div className="space-y-4 overflow-y-auto">
      {orders.map((order) => (
        <OrderCard
          key={order.orderId}
          order={order}
          onViewTickets={onViewTickets}
          onCancelOrder={onCancelOrder}
          getStatusIcon={getStatusIcon}
          getStatusColor={getStatusColor}
          formatDateTime={formatDateTime}
          formatCurrency={formatCurrency}
        />
      ))}
    </div>
  );
};