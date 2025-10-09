import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CheckoutHeaderProps {
  title: string;
  subtitle: string;
}

export const CheckoutHeader = ({ title, subtitle }: CheckoutHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between gap-6 mb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/client/cart")}
          className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors bg-neutral-800/50 hover:bg-neutral-700/50 px-4 py-2 rounded-xl"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </button>
        
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
          <p className="text-neutral-400 text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};