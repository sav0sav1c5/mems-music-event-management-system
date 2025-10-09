import { Card } from "../../../ticket-sales/components/ui/card";
import type { OrderDetailsDto } from "../../../shared/types/api/order";

interface OrderSummaryProps {
  order: OrderDetailsDto;
  formatCurrency: (amount: number) => string;
}

export const OrderSummary = ({ order, formatCurrency }: OrderSummaryProps) => {
  return (
    <div className="border-t border-neutral-800 pt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Subtotal</span>
            <span className="text-white">{formatCurrency(order.subtotal || 0)}</span>
          </div>
          {(order.discount || 0) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-400">Discount</span>
              <span className="text-green-400">-{formatCurrency(order.discount || 0)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-neutral-400">Service Fee</span>
            <span className="text-white">{formatCurrency(order.serviceFee || 0)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold border-t border-neutral-700 pt-3">
            <span className="text-white">Total</span>
            <span className="text-orange-400">{formatCurrency(order.totalAmount || 0)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};