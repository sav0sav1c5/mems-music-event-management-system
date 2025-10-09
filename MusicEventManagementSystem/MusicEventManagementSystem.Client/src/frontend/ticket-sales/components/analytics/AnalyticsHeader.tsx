import { CustomDatePicker } from '../../components/ui/customDatePicker';
import { FileText, FileSpreadsheet } from 'lucide-react';

interface AnalyticsHeaderProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  setDateRange: (field: 'from' | 'to', value: string) => void;
  isLoading: boolean;
  exportToPdf: () => void;
  exportToExcel: () => void;
}

export const AnalyticsHeader = ({
  dateRange,
  setDateRange,
  isLoading,
  exportToPdf,
  exportToExcel
}: AnalyticsHeaderProps) => {

  const formatDateForPicker = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h1>
          <p className="text-neutral-400 text-sm">Comprehensive ticket sales analytics and insights</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1 max-w-50">
            <label className="text-neutral-400 text-xs mb-1 block">Start Date</label>
            <CustomDatePicker
              value={formatDateForPicker(dateRange.from)}
              onChange={(value) => {
                console.log('📅 Start date changed:', value);
                setDateRange('from', value);
              }}
              placeholder="Start date"
              className="w-50"
            />
          </div>

          <div className="min-w-0 flex-1 max-w-50">
            <label className="text-neutral-400 text-xs mb-1 block">End Date</label>
            <CustomDatePicker
              value={formatDateForPicker(dateRange.to)}
              onChange={(value) => {
                console.log('📅 End date changed:', value);
                setDateRange('to', value);
              }}
              placeholder="End date"
              className="w-50"
            />
          </div>

          <button 
            onClick={exportToPdf}
            disabled={isLoading}
            className="px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-base bg-lime-500 text-black hover:bg-lime-400 border border-lime-400 disabled:opacity-50"
          >
            <FileText size={20} />
            PDF
          </button>
          
          <button 
            onClick={exportToExcel}
            disabled={isLoading}
            className="px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-base bg-lime-500 text-black hover:bg-lime-400 border border-lime-400 disabled:opacity-50"
          >
            <FileSpreadsheet size={20} />
            Excel
          </button>
        </div>
      </div>
    </div>
  );
};