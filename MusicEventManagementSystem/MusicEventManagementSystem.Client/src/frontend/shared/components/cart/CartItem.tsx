import { Trash2, Plus, Minus, Ticket, Loader2 } from 'lucide-react';
import { Card } from "../../../ticket-sales/components/ui/card";
import type { CartItemDto } from "../../../shared/types/api/cart";

interface CartItemProps {
  item: CartItemDto;
  updating: number | null;
  onUpdateQuantity: (ticketTypeId: number, newQuantity: number) => void;
  onRemoveItem: (ticketTypeId: number) => void;
  formatCurrency: (amount: number) => string;
}

const CartItem = ({ 
  item, 
  updating, 
  onUpdateQuantity, 
  onRemoveItem, 
  formatCurrency 
}: CartItemProps) => {
  return (
    <Card key={item.ticketTypeId} hover={true} className="p-6 group border border-neutral-800">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-orange-400/20 rounded-lg border border-orange-500/30">
              <Ticket className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white text-lg font-medium group-hover:text-orange-400 transition-colors">
                {item.eventName}
              </h3>
              <div className="space-y-1 text-sm text-neutral-400 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-orange-400">Ticket:</span>
                  <span>{item.ticketTypeName}</span>
                </div>
                {item.zoneName && (
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">Zone:</span>
                    <span>{item.zoneName}</span>
                  </div>
                )}
                {item.specialOfferName && (
                  <div className="flex items-center gap-2 text-green-400">
                    <span>✓ Special Offer: {item.specialOfferName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => onRemoveItem(item.ticketTypeId)}
          disabled={updating === item.ticketTypeId}
          className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 disabled:opacity-50"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
        <div className="flex items-center gap-3">
          <span className="text-neutral-400 text-sm">Quantity:</span>
          <div className="flex items-center gap-2 bg-neutral-800 rounded-lg p-1">
            <button
              onClick={() => onUpdateQuantity(item.ticketTypeId, item.quantity - 1)}
              disabled={updating === item.ticketTypeId || item.quantity <= 1}
              className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-400 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-white font-medium text-sm">
              {updating === item.ticketTypeId ? (
                <Loader2 className="w-3 h-3 animate-spin mx-auto" />
              ) : (
                item.quantity
              )}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.ticketTypeId, item.quantity + 1)}
              disabled={updating === item.ticketTypeId}
              className="p-2 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-400 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
        <div className="text-right">
          <p className="text-orange-400 text-lg font-bold">
            {formatCurrency(item.subtotal)}
          </p>
          <p className="text-neutral-400 text-xs">
            {formatCurrency(item.unitPrice)} each
            {item.discountAmount > 0 && (
              <span className="text-green-400 ml-1">
                (Save {formatCurrency(item.discountAmount * item.quantity)})
              </span>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CartItem;