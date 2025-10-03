import { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Users, Calendar, Download, Filter, TrendingUp, DollarSign, Ticket, MapPin, Gift, RefreshCw, Search, XCircle, AlertCircle } from 'lucide-react';

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
import { Card, KpiCard } from '../components/ui/card';
import { CustomSelect } from '../components/ui/customSelect';
import { CustomDatePicker } from '../components/ui/customDatePicker';

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
  const [dateRange, setDateRange] = useState({ 
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
    to: new Date() 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

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

  // Filter states
  const [chartTypeFilter, setChartTypeFilter] = useState('revenue');
  const [venueFilter, setVenueFilter] = useState('all');

  // Load data on component mount and when date range changes
  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
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
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load analytics data. Please try again.";
      setError(errorMessage);
      console.error("Error loading analytics data:", err);
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
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-full">
      <div className="text-white h-full flex flex-col p-4 m-1">
        {/* Main Content Area */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Side - Header, Statistics, and Analytics Content */}
          <div className="flex-1 flex flex-col transition-all duration-300 w-full">
            {/* Header - MOVES WITH THE CONTENT */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h1>
                  <p className="text-neutral-400 text-sm">Comprehensive ticket sales analytics and insights</p>
                </div>
                
                {/* Search and Filter - INTEGRATED IN HEADER LIKE OTHER PAGES */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="min-w-0 flex-1 max-w-60">
                    <CustomDatePicker
                      value={dateRange.from.toISOString().split('T')[0]}
                      onChange={(value) => setDateRange({...dateRange, from: new Date(value)})}
                      placeholder="Start date"
                      className="w-full"
                    />
                  </div>

                  <div className="min-w-0 flex-1 max-w-60">
                    <CustomDatePicker
                      value={dateRange.to.toISOString().split('T')[0]}
                      onChange={(value) => setDateRange({...dateRange, to: new Date(value)})}
                      placeholder="End date"
                      className="w-full"
                    />
                  </div>

                  <div className="min-w-0 flex-1 max-w-40">
                    <CustomSelect
                      value={chartTypeFilter}
                      onChange={setChartTypeFilter}
                      options={[
                        { value: 'revenue', label: 'Revenue' },
                        { value: 'tickets', label: 'Tickets' },
                        { value: 'conversion', label: 'Conversion' }
                      ]}
                      placeholder="Chart Type"
                      icon={<Filter className="w-5 h-5 text-neutral-400" />}
                    />
                  </div>

                  <button 
                    onClick={loadAnalyticsData}
                    disabled={isLoading}
                    className="px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-base bg-lime-500 text-black hover:bg-lime-400 disabled:bg-neutral-700 disabled:text-neutral-500"
                  >
                    <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                  </button>

                  <button 
                    onClick={exportData}
                    className="px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-base bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700"
                  >
                    <Download size={20} />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message - MOVES WITH THE CONTENT */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm mb-6">
                <div className="p-2 bg-red-500/20 rounded-xl">
                  <AlertCircle size={20} className="text-red-400" />
                </div>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Statistics - MOVES WITH THE CONTENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
              <KpiCard
                icon={DollarSign}
                title="Total Revenue"
                value={formatCurrency(kpis.totalRevenue)}
                change={kpis.revenueGrowth}
                changeType="percentage"
                color="lime"
              />

              <KpiCard
                icon={Ticket}
                title="Tickets Sold"
                value={kpis.totalTicketsSold.toLocaleString()}
                change={8.7}
                changeType="percentage"
                color="lime"
              />

              <KpiCard
                icon={TrendingUp}
                title="Conversion Rate"
                value={formatPercentage(kpis.conversionRate)}
                change={2.1}
                changeType="percentage"
                color="lime"
              />

              <KpiCard
                icon={MapPin}
                title="Capacity Utilization"
                value={formatPercentage(kpis.capacityUtilization)}
                change={5.3}
                changeType="percentage"
                color="lime"
              />
            </div>

            {/* Analytics Content - MOVES WITH THE CONTENT */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-6">
              {/* Revenue Trend Chart */}
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <h3 className="text-xl font-semibold text-white">Revenue Trend</h3>
                  <div className="flex items-center gap-4">
                    <p className="text-neutral-400 text-sm">Last 30 days</p>
                  </div>
                </div>
                
                <div className="mt-4 p-4">
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
              </Card>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Ticket Status Distribution */}
                <Card className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                    <h3 className="text-xl font-semibold text-white">Ticket Status Distribution</h3>
                  </div>
                  <div className="mt-4 p-4">
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
                </Card>

                {/* Venue Performance */}
                <Card className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                    <h3 className="text-xl font-semibold text-white">Top Venues Performance</h3>
                  </div>
                  <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
                    {venuePerformance.slice(0, 5).map((venue) => (
                      <div key={venue.venueId} className="p-4 bg-neutral-800/30 border border-neutral-700 rounded-xl hover:border-lime-500/50 transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-lime-500/20 p-2 rounded-xl border border-lime-500/30">
                              <MapPin className="w-4 h-4 text-lime-400" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{venue.venueName}</h4>
                              <p className="text-neutral-400 text-sm">Capacity: {venue.capacity.toLocaleString()}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            venue.occupancyRate >= 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            venue.occupancyRate >= 60 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'
                          } border`}>
                            {formatPercentage(venue.occupancyRate)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-400">Sold</span>
                            <div className="text-white font-medium">{venue.soldTickets.toLocaleString()}</div>
                          </div>
                          <div>
                            <span className="text-neutral-400">Revenue</span>
                            <div className="text-lime-400 font-medium">{formatCurrency(venue.revenue)}</div>
                          </div>
                          <div>
                            <span className="text-neutral-400">Avg Price</span>
                            <div className="text-white font-medium">{formatCurrency(venue.avgTicketPrice)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Special Offers Performance */}
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <h3 className="text-xl font-semibold text-white">Special Offers Performance</h3>
                  <div className="flex items-center gap-4">
                    <p className="text-neutral-400 text-sm">{offerPerformance.length} active offers</p>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  {offerPerformance.map((offer) => (
                    <div key={offer.offerId} className="p-6 bg-neutral-800/30 border border-neutral-700 rounded-xl hover:border-lime-500/50 transition-all duration-200 group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30 mr-4">
                            <Gift className="w-6 h-6 text-lime-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-lime-400 transition-colors">
                              {offer.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {offer.type}
                              </span>
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                offer.conversionRate >= 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                offer.conversionRate >= 60 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                'bg-red-500/20 text-red-400 border-red-500/30'
                              } border`}>
                                {formatPercentage(offer.conversionRate)} conversion
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-neutral-400" />
                            <span>Usage: {offer.usageCount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-lime-400" />
                            <span className="text-lime-400">Revenue: {formatCurrency(offer.revenueImpact)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-red-400" />
                            <span className="text-red-400">Discount: -{formatCurrency(offer.discountGiven)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-lime-400" />
                            <span className="text-lime-400">Net: {formatCurrency(offer.revenueImpact - offer.discountGiven)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;