import { Card } from "../../../ticket-sales/components/ui/card";
import { Lock } from "lucide-react";
import type { CartDto } from "../../../shared/types/api/cart";

interface OrderSummaryProps {
  cart: CartDto | null;
}

export const OrderSummary = ({ cart }: OrderSummaryProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const subtotal = cart?.subtotal || 0;
  const discount = cart?.totalDiscount || 0;
  const serviceFee = subtotal > 0 ? Math.max((subtotal - discount) * 0.08, 5) : 0;
  const total = subtotal - discount + serviceFee;

  return (
    <Card className="p-6 sticky top-4">
      <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
      
      {/* Tickets */}
      <div className="space-y-4 mb-6">
        {cart?.items.map((item) => (
          <div key={item.ticketTypeId} className="flex justify-between items-start pb-4 border-b border-neutral-800 last:border-b-0">
            <div className="flex-1">
              <p className="text-white text-sm font-medium">{item.eventName}</p>
              <p className="text-neutral-400 text-xs">
                {item.ticketTypeName} × {item.quantity}
              </p>
              {item.discountAmount > 0 && (
                <p className="text-green-400 text-xs mt-1">
                  Save {formatCurrency(item.discountAmount * item.quantity)}
                </p>
              )}
            </div>
            <p className="text-orange-400 font-bold text-lg">{formatCurrency(item.subtotal)}</p>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 border-t border-neutral-700 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Subtotal</span>
          <span className="text-white">{formatCurrency(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-400">Discount</span>
            <span className="text-green-400">-{formatCurrency(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Service Fee</span>
          <span className="text-white">{formatCurrency(serviceFee)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t border-neutral-700 pt-3">
          <span className="text-white">Total</span>
          <span className="text-orange-400 text-xl">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-neutral-800/30 rounded-xl border border-neutral-700">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">Secure Payment</span>
        </div>
        <p className="text-neutral-400 text-xs">
          Your payment information is encrypted and secure. We do not store your card details.
        </p>
      </div>
    </Card>
  );
};