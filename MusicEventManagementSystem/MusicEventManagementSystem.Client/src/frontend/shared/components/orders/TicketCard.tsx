import { Calendar, MapPin, Ticket, Download, QrCode } from "lucide-react";
import { Card } from "../../../ticket-sales/components/ui/card";
import type { OrderTicketDto } from "../../../shared/types/api/order";
import type { JSX } from "react";

interface TicketCardProps {
  ticket: OrderTicketDto;
  onDownload: (ticketId: number) => void;
  getStatusIcon: (status: string) => JSX.Element;
  getStatusColor: (status: string) => string;
  formatDateTime: (dateString?: string) => string;
}

export const TicketCard = ({ 
  ticket, 
  onDownload, 
  getStatusIcon, 
  getStatusColor, 
  formatDateTime 
}: TicketCardProps) => {
  return (
    <Card hover={true} className="p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-orange-400/20 rounded-lg border border-orange-500/30">
          <Ticket className="w-5 h-5 text-orange-400" />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-medium">Ticket #{ticket.ticketId}</h4>
          <p className="text-neutral-400 text-sm">{ticket.eventName}</p>
          <p className="text-neutral-400 text-xs">{ticket.ticketTypeName}</p>
        </div>
      </div>
      
      <div className="space-y-2 text-sm mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-400" />
          <span className="text-neutral-300">{formatDateTime(ticket.eventStartDate)}</span>
        </div>
        {ticket.zoneName && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" />
            <span className="text-neutral-300">{ticket.zoneName}</span>
          </div>
        )}
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium ${getStatusColor(ticket.status || '')}`}>
          {getStatusIcon(ticket.status || '')}
          {ticket.status || 'Unknown'}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center border-2 border-orange-400 overflow-hidden">
          {ticket.qrCode ? (
            <img 
              src={`data:image/png;base64,${ticket.qrCode}`} 
              alt="QR Code" 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center">
              <QrCode className="w-8 h-8 text-black mx-auto mb-1" />
              <span className="text-black text-xs font-medium">QR CODE</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => onDownload(ticket.ticketId)}
          className="text-orange-400 hover:text-orange-300 text-sm transition-colors flex items-center gap-1 font-medium"
        >
          <Download size={14} />
          Download PDF
        </button>
      </div>
    </Card>
  );
};