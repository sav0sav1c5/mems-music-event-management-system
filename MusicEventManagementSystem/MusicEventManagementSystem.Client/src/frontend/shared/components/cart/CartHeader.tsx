import { ShoppingCart } from 'lucide-react';

interface CartHeaderProps {
  totalItems: number;
}

const CartHeader = ({ totalItems }: CartHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">My Shopping Cart</h1>
        <p className="text-neutral-400 text-sm">Review your selected tickets</p>
      </div>
      <div className="flex items-center gap-2 text-neutral-400 bg-neutral-800/50 px-4 py-2 rounded-xl">
        <ShoppingCart size={20} />
        <span className="font-medium">{totalItems} items</span>
      </div>
    </div>
  );
};

export default CartHeader;