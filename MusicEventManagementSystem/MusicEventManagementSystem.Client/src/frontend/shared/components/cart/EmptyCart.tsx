import { ShoppingCart } from 'lucide-react';
import { Card } from "../../../ticket-sales/components/ui/card";
import { useNavigate } from "react-router-dom";

const EmptyCart = () => {
  const navigate = useNavigate();

  return (
    <Card className="text-center py-16">
      <div className="p-4 bg-neutral-800/50 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <ShoppingCart className="w-8 h-8 text-neutral-400" />
      </div>
      <p className="text-neutral-400 text-base mb-2">Your cart is empty</p>
      <p className="text-neutral-500 text-sm mb-6">Browse events and add tickets to get started</p>
      <button 
        onClick={() => navigate("/client/events")}
        className="px-6 py-3 rounded-xl bg-orange-400 text-black font-medium hover:bg-orange-500 transition-all duration-200 shadow-lg"
      >
        Browse Events
      </button>
    </Card>
  );
};

export default EmptyCart;