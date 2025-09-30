import { useState, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { 
  Calendar, Download, Filter, TrendingUp, DollarSign, 
  Ticket, MapPin, Gift, RefreshCw
} from 'lucide-react';

// Import services
import { TicketService } from '../services/ticketService';
import { RecordedSaleService } from '../services/recordedSaleService';
import { SpecialOfferService } from '../services/specialOfferService';
import { VenueService } from '../services/venueService';
import { TicketStatus, PaymentMethod, OfferType } from '../types';
import type { TicketResponse } from '../types/api/ticket';
import type { RecordedSaleResponse } from '../types/api/recordedSale';
import type { SpecialOfferResponse } from '../types/api/specialOffer';
import type { VenueResponse } from '../types/api/venue';

// Type definitions for analytics data
interface RevenueDataPoint {
  date: string;
  revenue: number;
  tickets: number;
}

interface PaymentMethodAnalytics {
  method: string;
  value: number;
  revenue: number;
}

interface TicketStatusAnalytics {
  status: string;
  count: number;
  revenue: number;
  percentage: number;
  color: string;
}

interface VenuePerformance {
  venueId: number;
  venueName: string;
  capacity: number;
  soldTickets: number;
  revenue: number;
  avgTicketPrice: number;
  occupancyRate: number;
}

interface SpecialOfferPerformance {
  offerId: number;
  name: string;
  type: string;
  usageCount: number;
  revenueImpact: number;
  discountGiven: number;
  conversionRate: number;
}

interface DashboardKPIs {
  totalRevenue: number;
  totalTicketsSold: number;
  averageTicketPrice: number;
  conversionRate: number;
  activeOffers: number;
  todaysSales: number;
  revenueGrowth: number;
  capacityUtilization: number;
}

  const getPaymentMethodName = (method: PaymentMethod): string => {
    switch (method) {
      case PaymentMethod.CreditCard: return 'Credit Card';
      case PaymentMethod.DebitCard: return 'Debit Card';
      case PaymentMethod.Cash: return 'Cash';
      case PaymentMethod.BankTransfer: return 'Bank Transfer';
      case PaymentMethod.PayPal: return 'PayPal';
      case PaymentMethod.ApplePay: return 'Apple Pay';
      case PaymentMethod.GooglePay: return 'Google Pay';
      case PaymentMethod.Cryptocurrency: return 'Cryptocurrency';
      default: return 'Unknown';
    }
  };

const getTicketStatusName = (status: TicketStatus): string => {
  switch (status) {
    case TicketStatus.Available: return 'Available';
    case TicketStatus.Reserved: return 'Reserved';
    case TicketStatus.Sold: return 'Sold';
    case TicketStatus.Used: return 'Used';
    case TicketStatus.Cancelled: return 'Cancelled';
    case TicketStatus.Expired: return 'Expired';
    case TicketStatus.Refunded: return 'Refunded';
    default: return 'Unknown';
  }
};

const getOfferTypeName = (offerType: OfferType): string => {
  switch (offerType) {
    case 0: return 'Early Bird';
    case 1: return 'Student Discount';
    case 2: return 'Group Discount';
    case 3: return 'Senior Discount';
    case 4: return 'Loyalty Discount';
    case 5: return 'Season Pass';
    case 6: return 'Buy One Get One';
    case 7: return 'Percentage Off';
    case 8: return 'Fixed Amount Off';
    default: return 'Unknown';
  }
};

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({ 
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
    to: new Date() 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Data states
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentMethodAnalytics[]>([]);
  const [ticketStatusData, setTicketStatusData] = useState<TicketStatusAnalytics[]>([]);
  const [venuePerformance, setVenuePerformance] = useState<VenuePerformance[]>([]);
  const [offerPerformance, setOfferPerformance] = useState<SpecialOfferPerformance[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs>({
    totalRevenue: 0,
    totalTicketsSold: 0,
    averageTicketPrice: 0,
    conversionRate: 0,
    activeOffers: 0,
    todaysSales: 0,
    revenueGrowth: 0,
    capacityUtilization: 0
  });

  // Load data on component mount and when date range changes
  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Fetch data from services
      const [tickets, sales, offers, venues] = await Promise.all([
        TicketService.getAllTickets(),
        RecordedSaleService.getAllRecordedSales(),
        SpecialOfferService.getAllSpecialOffers(),
        VenueService.getAllVenues()
      ]);

      // Filter data by date range
      const filteredSales = sales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate >= dateRange.from && saleDate <= dateRange.to;
      });

      const filteredTickets = tickets.filter(ticket => {
        const issueDate = new Date(ticket.issueDate);
        return issueDate >= dateRange.from && issueDate <= dateRange.to;
      });

      // Process data for analytics
      await processAnalyticsData(filteredTickets, filteredSales, offers, venues);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalyticsData = async (
    tickets: TicketResponse[], 
    sales: RecordedSaleResponse[], 
    offers: SpecialOfferResponse[], 
    venues: VenueResponse[]
  ) => {
    // Process revenue data by date
    const revenueByDate = processRevenueByDate(sales);
    setRevenueData(revenueByDate);

    // Process payment method data
    const paymentMethods = processPaymentMethods(sales);
    setPaymentData(paymentMethods);

    // Process ticket status data
    const ticketStatus = processTicketStatus(tickets);
    setTicketStatusData(ticketStatus);

    // Process venue performance
    const venuePerf = await processVenuePerformance(venues, tickets, sales);
    setVenuePerformance(venuePerf);

    // Process offer performance
    const offerPerf = processOfferPerformance(offers, sales);
    setOfferPerformance(offerPerf);

    // Calculate KPIs
    const kpisData = calculateKPIs(revenueByDate, ticketStatus, venuePerf, offerPerf);
    setKpis(kpisData);
  };

  const processRevenueByDate = (salesData: RecordedSaleResponse[]): RevenueDataPoint[] => {
    const revenueMap = new Map<string, { revenue: number; tickets: number }>();
    
    salesData.forEach(sale => {
      const date = new Date(sale.saleDate).toISOString().split('T')[0];
      const existing = revenueMap.get(date) || { revenue: 0, tickets: 0 };
      
      revenueMap.set(date, {
        revenue: existing.revenue + sale.totalAmount,
        tickets: existing.tickets + (sale.ticketIds?.length || 0)
      });
    });

    return Array.from(revenueMap.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      tickets: data.tickets
    })).sort((a, b) => a.date.localeCompare(b.date));
  };

  const processPaymentMethods = (salesData: RecordedSaleResponse[]): PaymentMethodAnalytics[] => {
    const paymentMap = new Map<PaymentMethod, { count: number; revenue: number }>();
    let totalRevenue = 0;

    salesData.forEach(sale => {
      const existing = paymentMap.get(sale.paymentMethod) || { count: 0, revenue: 0 };
      paymentMap.set(sale.paymentMethod, {
        count: existing.count + 1,
        revenue: existing.revenue + sale.totalAmount
      });
      totalRevenue += sale.totalAmount;
    });

    return Array.from(paymentMap.entries()).map(([method, data]) => ({
      method: getPaymentMethodName(method),
      value: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      revenue: data.revenue
    }));
  };

  const processTicketStatus = (tickets: TicketResponse[]): TicketStatusAnalytics[] => {
    const statusMap = new Map<TicketStatus, { count: number; revenue: number }>();
    const totalTickets = tickets.length;

    tickets.forEach(ticket => {
      const existing = statusMap.get(ticket.status) || { count: 0, revenue: 0 };
      statusMap.set(ticket.status, {
        count: existing.count + 1,
        revenue: existing.revenue + ticket.finalPrice
      });
    });

    // Define colors for each status
    const colors: Record<TicketStatus, string> = {
      [TicketStatus.Available]: '#3b82f6',
      [TicketStatus.Reserved]: '#f59e0b',
      [TicketStatus.Sold]: '#10b981',
      [TicketStatus.Used]: '#8b5cf6',
      [TicketStatus.Cancelled]: '#ef4444',
      [TicketStatus.Expired]: '#6b7280',
      [TicketStatus.Refunded]: '#ec4899'
    };

    return Array.from(statusMap.entries()).map(([status, data]) => ({
      status: getTicketStatusName(status),
      count: data.count,
      revenue: data.revenue,
      percentage: totalTickets > 0 ? (data.count / totalTickets) * 100 : 0,
      color: colors[status] || '#6b7280'
    }));
  };

  const processVenuePerformance = async (
    venues: VenueResponse[], 
    tickets: TicketResponse[], 
    salesData: RecordedSaleResponse[]
  ): Promise<VenuePerformance[]> => {
    const venuePerformance: VenuePerformance[] = [];

    for (const venue of venues) {
      // Simplified - in reality, you'd filter by events at this venue
      const soldTickets = tickets.filter(t => t.status === TicketStatus.Sold).length;
      const venueRevenue = salesData.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const avgTicketPrice = soldTickets > 0 ? venueRevenue / soldTickets : 0;
      const occupancyRate = venue.capacity > 0 ? (soldTickets / venue.capacity) * 100 : 0;

      venuePerformance.push({
        venueId: venue.venueId,
        venueName: venue.name || `Venue ${venue.venueId}`,
        capacity: venue.capacity,
        soldTickets,
        revenue: venueRevenue,
        avgTicketPrice,
        occupancyRate
      });
    }

    return venuePerformance;
  };

  const processOfferPerformance = (
    offers: SpecialOfferResponse[], 
    salesData: RecordedSaleResponse[]
  ): SpecialOfferPerformance[] => {
    return offers.map(offer => {
      const offerSales = salesData.filter(sale => 
        sale.specialOfferIds?.includes(offer.specialOfferId)
      );
      
      const usageCount = offerSales.length;
      const revenueImpact = offerSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const discountGiven = offerSales.reduce((sum, sale) => {
        // Simplified discount calculation
        return sum + (sale.totalAmount * offer.discountValue / 100);
      }, 0);
      
      const totalSales = salesData.length;
      const conversionRate = totalSales > 0 ? (usageCount / totalSales) * 100 : 0;

      return {
        offerId: offer.specialOfferId,
        name: offer.name || `Offer ${offer.specialOfferId}`,
        type: getOfferTypeName(offer.offerType),
        usageCount,
        revenueImpact,
        discountGiven,
        conversionRate
      };
    });
  };

  const calculateKPIs = (
    revenueData: RevenueDataPoint[],
    ticketStatus: TicketStatusAnalytics[],
    venuePerformance: VenuePerformance[],
    offerPerformance: SpecialOfferPerformance[]
  ): DashboardKPIs => {
    const totalRevenue = revenueData.reduce((sum, day) => sum + day.revenue, 0);
    const totalTicketsSold = revenueData.reduce((sum, day) => sum + day.tickets, 0);
    const averageTicketPrice = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0;
    
    const soldTickets = ticketStatus.find(s => s.status === 'Sold')?.count || 0;
    const availableTickets = ticketStatus.find(s => s.status === 'Available')?.count || 0;
    const conversionRate = (soldTickets + availableTickets) > 0 ? 
      (soldTickets / (soldTickets + availableTickets)) * 100 : 0;

    const totalCapacity = venuePerformance.reduce((sum, venue) => sum + venue.capacity, 0);
    const totalSold = venuePerformance.reduce((sum, venue) => sum + venue.soldTickets, 0);
    const capacityUtilization = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;

    const today = new Date().toISOString().split('T')[0];
    const todaysSales = revenueData.find(day => day.date === today)?.tickets || 0;

    // Simplified growth calculation
    const revenueGrowth = revenueData.length > 1 ? 
      ((revenueData[revenueData.length - 1].revenue - revenueData[0].revenue) / revenueData[0].revenue) * 100 : 0;

    return {
      totalRevenue,
      totalTicketsSold,
      averageTicketPrice,
      conversionRate,
      activeOffers: offerPerformance.length,
      todaysSales,
      revenueGrowth,
      capacityUtilization
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const exportData = () => {
    const data = {
      kpis,
      revenueData,
      paymentData,
      ticketStatusData,
      venuePerformance,
      offerPerformance,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="text-white h-full flex flex-col p-2">
      {/* Header - Consistent Design */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h1>
            <p className="text-neutral-400 text-sm">Comprehensive ticket sales analytics and insights</p>
          </div>
          <div className="flex gap-5">
            <button
              onClick={() => setIsLoading(!isLoading)}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-3 border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm text-neutral-300 rounded-xl hover:bg-neutral-800 hover:text-white hover:border-neutral-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportData}
              className="px-6 py-3 rounded-xl bg-lime-400 text-black font-medium hover:bg-lime-500 transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
        
        {/* Date Range Selector - Consistent Design */}
        <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="text-neutral-400" size={16} />
              <span className="text-neutral-300 text-sm">Date Range:</span>
            </div>
            <input
              type="date"
              value={dateRange.from.toISOString().split('T')[0]}
              onChange={(e) => setDateRange({...dateRange, from: new Date(e.target.value)})}
              className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-2xl focus:outline-none focus:border-lime-400 transition-all duration-200"
            />
            <span className="text-neutral-400">to</span>
            <input
              type="date"
              value={dateRange.to.toISOString().split('T')[0]}
              onChange={(e) => setDateRange({...dateRange, to: new Date(e.target.value)})}
              className="px-4 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-2xl focus:outline-none focus:border-lime-400 transition-all duration-200"
            />
            <button
              onClick={() => setIsLoading(!isLoading)}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-lime-400/10 text-lime-400 border border-lime-400/20 rounded-xl hover:bg-lime-400/20 transition-all duration-200 disabled:opacity-50"
            >
              <Filter size={16} className="mr-2" />
              Apply Filter
            </button>
          </div>
          <p className="text-neutral-500 text-sm mt-4">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Tabs - Consistent Design */}
      <div className="space-y-4">
        <div className="flex space-x-1 rounded-2xl bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 p-1 shadow-lg">
          {[
            { value: 'overview', label: 'Overview' },
            { value: 'revenue', label: 'Revenue' },
            { value: 'tickets', label: 'Tickets' },
            { value: 'venues', label: 'Venues' },
            { value: 'offers', label: 'Offers' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                activeTab === tab.value
                  ? 'bg-lime-400 text-black shadow-lg font-medium'
                  : 'text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* KPI Summary - Consistent Design */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center justify-between px-6 py-6 bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-800 shadow-lg hover:border-neutral-700 transition-all duration-200">
                <div className="p-3 bg-lime-400/20 rounded-xl">
                  <DollarSign className="text-lime-400 w-8 h-8" />
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-neutral-400 text-sm">Total Revenue</p>
                  <p className="text-white text-2xl font-bold">{formatCurrency(kpis.totalRevenue)}</p>
                  <div className="flex items-center text-lime-400 text-sm font-medium mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{formatPercentage(kpis.revenueGrowth)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-6 py-6 bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-800 shadow-lg hover:border-neutral-700 transition-all duration-200">
                <div className="p-3 bg-lime-400/20 rounded-xl">
                  <Ticket className="text-lime-400 w-8 h-8" />
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-neutral-400 text-sm">Tickets Sold</p>
                  <p className="text-white text-2xl font-bold">{kpis.totalTicketsSold.toLocaleString()}</p>
                  <div className="flex items-center text-lime-400 text-sm font-medium mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +8.7%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-6 py-6 bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-800 shadow-lg hover:border-neutral-700 transition-all duration-200">
                <div className="p-3 bg-lime-400/20 rounded-xl">
                  <TrendingUp className="text-lime-400 w-8 h-8" />
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-neutral-400 text-sm">Conversion Rate</p>
                  <p className="text-white text-2xl font-bold">{formatPercentage(kpis.conversionRate)}</p>
                  <div className="flex items-center text-lime-400 text-sm font-medium mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +2.1%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-6 py-6 bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-800 shadow-lg hover:border-neutral-700 transition-all duration-200">
                <div className="p-3 bg-lime-400/20 rounded-xl">
                  <MapPin className="text-lime-400 w-8 h-8" />
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-neutral-400 text-sm">Capacity Utilization</p>
                  <p className="text-white text-2xl font-bold">{formatPercentage(kpis.capacityUtilization)}</p>
                  <div className="flex items-center text-lime-400 text-sm font-medium mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +5.3%
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Revenue Trend Chart */}
              <div className="bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-800 shadow-lg overflow-hidden hover:border-neutral-700 transition-all duration-200">
                <div className="p-6 border-b border-neutral-800">
                  <h3 className="text-xl font-semibold text-white">Revenue Trend</h3>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9ca3af" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis stroke="#9ca3af" tickFormatter={(value) => `${(value / 1000)}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#171717', 
                          border: '1px solid #404040',
                          borderRadius: '12px',
                          color: '#ffffff'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#a3e635" 
                        fill="#a3e635" 
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Ticket Status Distribution */}
              <div className="bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-800 shadow-lg overflow-hidden hover:border-neutral-700 transition-all duration-200">
                <div className="p-6 border-b border-neutral-800">
                  <h3 className="text-xl font-semibold text-white">Ticket Status Distribution</h3>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ticketStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {ticketStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#171717', 
                          border: '1px solid #404040',
                          borderRadius: '12px',
                          color: '#ffffff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {ticketStatusData.map((item) => (
                      <div key={item.status} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-neutral-400 text-sm">{item.status}: {item.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'venues' && (
          <div className="space-y-6">
            {/* Venue Performance */}
            <div className="bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-800 shadow-lg overflow-hidden hover:border-neutral-700 transition-all duration-200">
              <div className="p-6 border-b border-neutral-800">
                <h3 className="text-xl font-semibold text-white">Venue Performance Analysis</h3>
              </div>
              <div className="p-6 space-y-6">
                {venuePerformance.map((venue) => (
                  <div key={venue.venueId} className="p-6 bg-neutral-800/50 border border-neutral-700 rounded-2xl hover:border-neutral-600 transition-all duration-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-lime-400/20 rounded-xl">
                          <MapPin className="text-lime-400" size={20} />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-lg">{venue.venueName}</h4>
                          <p className="text-neutral-400 text-sm">Capacity: {venue.capacity.toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium ${
                        venue.occupancyRate >= 80 ? 'bg-green-500/20 text-green-400' :
                        venue.occupancyRate >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {formatPercentage(venue.occupancyRate)} occupancy
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-6 text-sm mb-6">
                      <div>
                        <span className="text-neutral-400">Sold Tickets</span>
                        <div className="text-white font-medium mt-1 text-base">{venue.soldTickets.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-neutral-400">Revenue</span>
                        <div className="text-lime-400 font-medium mt-1 text-base">{formatCurrency(venue.revenue)}</div>
                      </div>
                      <div>
                        <span className="text-neutral-400">Avg Price</span>
                        <div className="text-white font-medium mt-1 text-base">{formatCurrency(venue.avgTicketPrice)}</div>
                      </div>
                      <div>
                        <span className="text-neutral-400">Utilization</span>
                        <div className="text-white font-medium mt-1 text-base">{formatPercentage(venue.occupancyRate)}</div>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-2">
                      <div 
                        className="bg-lime-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${venue.occupancyRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="space-y-6">
            {/* Special Offers Performance */}
            <div className="bg-neutral-900/80 backdrop-blur-sm rounded-2xl border border-neutral-800 shadow-lg overflow-hidden hover:border-neutral-700 transition-all duration-200">
              <div className="p-6 border-b border-neutral-800">
                <h3 className="text-xl font-semibold text-white">Special Offers Performance</h3>
              </div>
              <div className="p-6 space-y-6">
                {offerPerformance.map((offer) => (
                  <div key={offer.offerId} className="p-6 bg-neutral-800/50 border border-neutral-700 rounded-2xl hover:border-neutral-600 transition-all duration-200">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-lime-400/20 rounded-xl">
                          <Gift className="text-lime-400" size={20} />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-lg">{offer.name}</h4>
                          <p className="text-neutral-400 text-sm">Type: {offer.type}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium ${
                        offer.conversionRate >= 80 ? 'bg-green-500/20 text-green-400' :
                        offer.conversionRate >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {formatPercentage(offer.conversionRate)} conversion
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-6 text-sm mb-6">
                      <div>
                        <span className="text-neutral-400">Usage Count</span>
                        <div className="text-white font-medium mt-1 text-base">{offer.usageCount.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-neutral-400">Revenue Impact</span>
                        <div className="text-lime-400 font-medium mt-1 text-base">{formatCurrency(offer.revenueImpact)}</div>
                      </div>
                      <div>
                        <span className="text-neutral-400">Discount Given</span>
                        <div className="text-red-400 font-medium mt-1 text-base">-{formatCurrency(offer.discountGiven)}</div>
                      </div>
                      <div>
                        <span className="text-neutral-400">Net Impact</span>
                        <div className="text-lime-400 font-medium mt-1 text-base">
                          {formatCurrency(offer.revenueImpact - offer.discountGiven)}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-2">
                      <div 
                        className="bg-lime-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${offer.conversionRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;