import { Trash2, CreditCard, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from "../../../ticket-sales/components/ui/card";

interface OrderSummaryProps {
  subtotal: number;
  cartDiscount: number;
  promoDiscount: number;
  promoDiscountAmount: number;
  serviceFee: number;
  total: number;
  promoCode: string;
  appliedPromo: string | null;
  applyingPromo: boolean;
  onPromoCodeChange: (code: string) => void;
  onApplyPromoCode: () => void;
  onRemovePromoCode: () => void;
  onCheckout: () => void;
  formatCurrency: (amount: number) => string;
}

const OrderSummary = ({
  subtotal,
  cartDiscount,
  promoDiscount,
  promoDiscountAmount,
  serviceFee,
  total,
  promoCode,
  appliedPromo,
  applyingPromo,
  onPromoCodeChange,
  onApplyPromoCode,
  onRemovePromoCode,
  onCheckout,
  formatCurrency
}: OrderSummaryProps) => {
  return (
    <Card className="p-6 sticky top-4 border border-neutral-800">
      <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>
      
      {/* Promo Code */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-300 mb-2">Promo Code</label>
        {appliedPromo ? (
          <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div>
              <span className="text-green-400 text-sm font-medium">{appliedPromo}</span>
              <p className="text-green-300 text-xs">{promoDiscount}% discount applied</p>
            </div>
            <button
              onClick={onRemovePromoCode}
              className="text-green-400 hover:text-green-300 transition-colors p-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onApplyPromoCode()}
              placeholder="Enter promo code"
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
            />
            <button
              onClick={onApplyPromoCode}
              disabled={!promoCode.trim() || applyingPromo}
              className="px-4 py-2 bg-orange-400 hover:bg-orange-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-black disabled:text-neutral-400 rounded-xl transition-all duration-200 font-medium text-sm flex items-center gap-2"
            >
              {applyingPromo ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                "Apply"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Subtotal</span>
          <span className="text-white">{formatCurrency(subtotal)}</span>
        </div>
        
        {cartDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-400">Cart Discounts</span>
            <span className="text-green-400">-{formatCurrency(cartDiscount)}</span>
          </div>
        )}
        
        {promoDiscount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-400">Promo Discount ({promoDiscount}%)</span>
            <span className="text-green-400">-{formatCurrency(promoDiscountAmount)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-neutral-400">Service Fee</span>
          <span className="text-white">{formatCurrency(serviceFee)}</span>
        </div>
        
        <div className="border-t border-neutral-700 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-white font-semibold">Total</span>
            <span className="text-orange-400 text-xl font-bold">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-orange-400 text-sm font-medium">Important Notice</p>
            <p className="text-orange-300 text-xs mt-1">
              Tickets are held for 15 minutes. Complete your purchase to secure your tickets.
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <button 
        onClick={onCheckout}
        className="w-full bg-orange-400 hover:bg-orange-500 text-black py-4 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center gap-2 font-semibold text-lg"
      >
        <CreditCard size={20} />
        Proceed to Checkout
      </button>

      {/* Security Notice */}
      <p className="text-neutral-500 text-xs mt-4 text-center">
        🔒 Secure checkout powered by 256-bit SSL encryption
      </p>
    </Card>
  );
};

export default OrderSummary;