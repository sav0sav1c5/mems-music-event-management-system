import { Ticket } from "lucide-react";
import { Card } from "../../../ticket-sales/components/ui/card";

interface EmptyOrdersProps {
  onBrowseEvents: () => void;
}

export const EmptyOrders = ({ onBrowseEvents }: EmptyOrdersProps) => {
  return (
    <Card className="text-center py-16">
      <div className="p-4 bg-neutral-800/50 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <Ticket className="w-8 h-8 text-neutral-400" />
      </div>
      <p className="text-neutral-400 text-base mb-2">No orders yet</p>
      <p className="text-neutral-500 text-sm mb-6">Browse events and purchase tickets to see them here</p>
      <button 
        onClick={onBrowseEvents}
        className="px-6 py-3 rounded-xl bg-orange-400 text-black font-medium hover:bg-orange-500 transition-all duration-200 shadow-lg"
      >
        Browse Events
      </button>
    </Card>
  );
};