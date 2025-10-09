import { Trash2 } from 'lucide-react';
import CartItem from './CartItem';
import type { CartItemDto } from "../../../shared/types/api/cart";

interface CartItemsProps {
  items: CartItemDto[];
  updating: number | null;
  onUpdateQuantity: (ticketTypeId: number, newQuantity: number) => void;
  onRemoveItem: (ticketTypeId: number) => void;
  onClearCart: () => void;
  formatCurrency: (amount: number) => string;
}

const CartItems = ({ 
  items, 
  updating, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart, 
  formatCurrency 
}: CartItemsProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Cart Items</h2>
        <button
          onClick={onClearCart}
          className="px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm"
        >
          <Trash2 size={16} />
          Clear Entire Cart
        </button>
      </div>
      
      {items.map((item: CartItemDto) => (
        <CartItem
          key={item.ticketTypeId}
          item={item}
          updating={updating}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          formatCurrency={formatCurrency}
        />
      ))}
    </div>
  );
};

export default CartItems;