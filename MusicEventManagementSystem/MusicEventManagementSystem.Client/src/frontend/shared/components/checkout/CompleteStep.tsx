import { Card } from "../../../ticket-sales/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CompleteStepProps {
  orderId: number | null;
  total: number;
}

export const CompleteStep = ({ orderId, total }: CompleteStepProps) => {
  const navigate = useNavigate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
      <Card className="p-12 text-center">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Order Complete!</h1>
        <p className="text-neutral-400 mb-6 text-base">
          Thank you for your purchase. Your tickets have been sent to your email.
        </p>
        <div className="bg-neutral-800/30 rounded-xl p-6 mb-8 border border-neutral-700">
          <p className="text-white mb-2 text-lg">
            Order #: <span className="text-orange-400 font-bold">
              {orderId ? `ORD-${String(orderId).padStart(8, '0')}` : 'Processing...'}
            </span>
          </p>
          <p className="text-neutral-400">
            Total: <span className="text-white font-medium text-lg">{formatCurrency(total)}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate("/client/orders")}
            className="flex-1 bg-orange-400 hover:bg-orange-500 text-black py-3 rounded-xl transition-all duration-200 font-medium shadow-lg"
          >
            View My Tickets
          </button>
          <button 
            onClick={() => navigate("/client/events")}
            className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-xl transition-all duration-200 border border-neutral-700"
          >
            Browse More Events
          </button>
        </div>
      </Card>
    </div>
  );
};