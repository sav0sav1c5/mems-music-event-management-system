import React from 'react';
import { Card } from '../../components/ui/card';
import { RefreshCw, Database, Clock } from 'lucide-react';

interface AuditLogEntry {
  auditId: number;
  recordedSaleId: number;
  action: string;
  oldTotalAmount: number | null;
  newTotalAmount: number | null;
  ticketCount: number;
  changedAt: string;
  changedBy: string;
}

interface AuditTabProps {
  auditLog: AuditLogEntry[];
  isLoading: boolean;
  loadAuditLog: () => void;
  formatCurrency: (amount: number | undefined | null) => string;
  formatDateTime: (dateStr: string) => string;
  getActionIcon: (action: string) => React.ReactElement;
  getActionColor: (action: string) => string;
}

export const AuditTab = ({
  auditLog,
  isLoading,
  loadAuditLog,
  formatCurrency,
  formatDateTime,
  getActionIcon,
  getActionColor
}: AuditTabProps) => {
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Sales Audit Log</h3>
        <button 
          onClick={loadAuditLog}
          disabled={isLoading}
          className="px-4 py-2 bg-lime-500 text-black rounded-lg hover:bg-lime-400 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
      <div className="space-y-3">
        {auditLog.length === 0 && !isLoading && (
          <div className="text-center py-12 text-neutral-400">
            <Database size={48} className="mx-auto mb-4 opacity-50" />
            <p>No audit log entries found</p>
          </div>
        )}
        {auditLog.map((entry) => (
          <div key={entry.auditId} className="p-4 bg-neutral-800/30 border border-neutral-700 rounded-xl hover:border-lime-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {getActionIcon(entry.action)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">Sale ID: {entry.recordedSaleId}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(entry.action)}`}>
                      {entry.action}
                    </span>
                  </div>
                  <p className="text-neutral-400 text-sm mt-1">
                    <Clock size={12} className="inline mr-1" />
                    {formatDateTime(entry.changedAt)} by {entry.changedBy}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-neutral-400">Old Amount</span>
                <div className="text-white font-medium">
                  {entry.oldTotalAmount !== null ? formatCurrency(entry.oldTotalAmount) : 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-neutral-400">New Amount</span>
                <div className="text-lime-400 font-medium">
                  {entry.newTotalAmount !== null ? formatCurrency(entry.newTotalAmount) : 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-neutral-400">Tickets</span>
                <div className="text-white font-medium">{entry.ticketCount}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};