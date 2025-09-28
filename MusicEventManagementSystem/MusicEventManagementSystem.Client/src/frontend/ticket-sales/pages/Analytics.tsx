import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  ComposedChart
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
import { EventService } from '../../event-organization/services/eventService';
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

  // Custom tab components
  const Tabs = ({ children }: { children: any }) => {
    return <div className="tabs">{children}</div>;
  };

  const TabsList = ({ children, className }: { children: any, className?: string }) => {
    return (
      <div className={`flex space-x-1 rounded-lg bg-neutral-800 p-1 ${className}`}>
        {children}
      </div>
    );
  };

  const TabsTrigger = ({ children, value }: { children: any, value: string }) => {
    const isActive = activeTab === value;
    return (
      <button
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
          isActive 
            ? 'bg-lime-400/20 text-lime-400 shadow' 
            : 'text-neutral-400 hover:text-neutral-300'
        }`}
        onClick={() => setActiveTab(value)}
      >
        {children}
      </button>
    );
  };

  const TabsContent = ({ children, value }: { children: any, value: string }) => {
    if (activeTab !== value) return null;
    return <div className="mt-6">{children}</div>;
  };

  const Card = ({ children, className }: { children: any, className?: string }) => {
    return (
      <div className={`rounded-xl border border-neutral-800 bg-neutral-900/80 ${className}`}>
        {children}
      </div>
    );
  };

  const Button = ({ children, onClick, disabled, variant, className }: { children: any, onClick?: () => void, disabled?: boolean, variant?: string, className?: string }) => {
    const baseClass = "px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClass = variant === 'outline' 
      ? "border border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-600" 
      : "bg-lime-500 text-white hover:bg-lime-600";
    
    return (
      <button 
        className={`${baseClass} ${variantClass} ${className}`}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    );
  };

  const Input = ({ type, value, onChange, className }: { type: string, value: string, onChange: (e: any) => void, className?: string }) => {
    return (
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={`px-3 py-2 rounded-lg border border-neutral-700 bg-neutral-800 text-white focus:outline-none focus:border-lime-500 ${className}`}
      />
    );
  };

  const Badge = ({ children, variant, className }: { children: any, variant?: string, className?: string }) => {
    const baseClass = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    const variantClass = variant === 'outline' 
      ? "border border-lime-400/50 text-lime-400"
      : "bg-lime-400/20 text-lime-400";
    
    return (
      <span className={`${baseClass} ${variantClass} ${className}`}>
        {children}
      </span>
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-neutral-400">
            Comprehensive ticket sales analytics and insights
          </p>
          <p className="text-neutral-500 text-sm mt-1">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadAnalyticsData}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            onClick={exportData}
          >
            <Download size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="text-neutral-400" size={16} />
            <span className="text-neutral-300 text-sm">Date Range:</span>
          </div>
          <Input
            type="date"
            value={dateRange.from.toISOString().split('T')[0]}
            onChange={(e) => setDateRange({...dateRange, from: new Date(e.target.value)})}
            className="w-auto"
          />
          <span className="text-neutral-400">to</span>
          <Input
            type="date"
            value={dateRange.to.toISOString().split('T')[0]}
            onChange={(e) => setDateRange({...dateRange, to: new Date(e.target.value)})}
            className="w-auto"
          />
          <Button 
            variant="outline" 
            onClick={loadAnalyticsData}
            disabled={isLoading}
          >
            <Filter size={16} className="mr-2" />
            Apply Filter
          </Button>
        </div>
      </Card>

      <Tabs>
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* KPI Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Total Revenue</p>
                  <p className="text-white text-2xl">{formatCurrency(kpis.totalRevenue)}</p>
                  <div className="flex items-center text-lime-400 text-sm mt-1">
                    <TrendingUp size={16} className="mr-1" />
                    +{formatPercentage(kpis.revenueGrowth)}
                  </div>
                </div>
                <div className="p-3 bg-lime-400/20 rounded-xl">
                  <DollarSign className="text-lime-400" size={24} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Tickets Sold</p>
                  <p className="text-white text-2xl">{kpis.totalTicketsSold.toLocaleString()}</p>
                  <div className="flex items-center text-lime-400 text-sm mt-1">
                    <TrendingUp size={16} className="mr-1" />
                    +8.7%
                  </div>
                </div>
                <div className="p-3 bg-lime-400/20 rounded-xl">
                  <Ticket className="text-lime-400" size={24} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Conversion Rate</p>
                  <p className="text-white text-2xl">{formatPercentage(kpis.conversionRate)}</p>
                  <div className="flex items-center text-lime-400 text-sm mt-1">
                    <TrendingUp size={16} className="mr-1" />
                    +2.1%
                  </div>
                </div>
                <div className="p-3 bg-lime-400/20 rounded-xl">
                  <DollarSign className="text-lime-400" size={24} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Capacity Utilization</p>
                  <p className="text-white text-2xl">{formatPercentage(kpis.capacityUtilization)}</p>
                  <div className="flex items-center text-lime-400 text-sm mt-1">
                    <TrendingUp size={16} className="mr-1" />
                    +5.3%
                  </div>
                </div>
                <div className="p-3 bg-lime-400/20 rounded-xl">
                  <DollarSign className="text-lime-400" size={24} />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card className="p-6">
              <h3 className="text-white mb-4 text-lg font-semibold">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value / 1000)}k`} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#262626', 
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#84cc16" 
                    fill="#84cc16" 
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Ticket Status Distribution */}
            <Card className="p-6">
              <h3 className="text-white mb-4 text-lg font-semibold">Ticket Status Distribution</h3>
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
                      backgroundColor: '#262626', 
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {ticketStatusData.map((item) => (
                  <div key={item.status} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-neutral-400 text-sm">{item.status}: {item.percentage.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Total Revenue</p>
                  <p className="text-white text-2xl">{formatCurrency(kpis.totalRevenue)}</p>
                </div>
                <DollarSign className="text-lime-400" size={32} />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Avg Ticket Price</p>
                  <p className="text-white text-2xl">{formatCurrency(kpis.averageTicketPrice)}</p>
                </div>
                <Ticket className="text-lime-400" size={32} />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Today's Sales</p>
                  <p className="text-white text-2xl">{kpis.todaysSales.toLocaleString()}</p>
                </div>
                <DollarSign className="text-lime-400" size={32} />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Tickets Chart */}
            <Card className="p-6">
              <h3 className="text-white mb-4 text-lg font-semibold">Revenue vs Tickets Sold</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis yAxisId="revenue" stroke="#84cc16" />
                  <YAxis yAxisId="tickets" orientation="right" stroke="#3b82f6" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#262626', 
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Bar yAxisId="revenue" dataKey="revenue" fill="#84cc16" fillOpacity={0.6} />
                  <Line yAxisId="tickets" type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>

            {/* Payment Methods */}
            <Card className="p-6">
              <h3 className="text-white mb-4 text-lg font-semibold">Payment Method Distribution</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={paymentData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis type="category" dataKey="method" stroke="#9ca3af" width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#262626', 
                      border: '1px solid #404040',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Percentage']}
                  />
                  <Bar dataKey="value" fill="#84cc16" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="venues">
          {/* Venue Performance */}
          <Card className="p-6 mb-6">
            <h3 className="text-white mb-4 text-lg font-semibold">Venue Performance Analysis</h3>
            <div className="space-y-4">
              {venuePerformance.map((venue) => (
                <div key={venue.venueId} className="p-4 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="text-lime-400" size={20} />
                      <div>
                        <h4 className="text-white">{venue.venueName}</h4>
                        <p className="text-neutral-400 text-sm">Capacity: {venue.capacity.toLocaleString()}</p>
                      </div>
                    </div>
                    <Badge 
                      className={
                        venue.occupancyRate >= 80 ? 'bg-green-400/20 text-green-400' :
                        venue.occupancyRate >= 60 ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-red-400/20 text-red-400'
                      }
                    >
                      {formatPercentage(venue.occupancyRate)} occupancy
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-neutral-400">Sold Tickets</span>
                      <div className="text-white">{venue.soldTickets.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Revenue</span>
                      <div className="text-lime-400">{formatCurrency(venue.revenue)}</div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Avg Price</span>
                      <div className="text-white">{formatCurrency(venue.avgTicketPrice)}</div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Utilization</span>
                      <div className="text-white">{formatPercentage(venue.occupancyRate)}</div>
                    </div>
                  </div>
                  <div className="w-full bg-neutral-700 rounded-full h-3">
                    <div 
                      className="bg-lime-400 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${venue.occupancyRate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Venue Revenue Comparison */}
          <Card className="p-6">
            <h3 className="text-white mb-4 text-lg font-semibold">Venue Revenue Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={venuePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="venueName" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#262626', 
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#84cc16" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="offers">
          {/* Special Offers Performance */}
          <Card className="p-6 mb-6">
            <h3 className="text-white mb-4 text-lg font-semibold">Special Offers Performance</h3>
            <div className="space-y-4">
              {offerPerformance.map((offer) => (
                <div key={offer.offerId} className="p-4 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Gift className="text-lime-400" size={20} />
                      <div>
                        <h4 className="text-white">{offer.name}</h4>
                        <p className="text-neutral-400 text-sm">Type: {offer.type}</p>
                      </div>
                    </div>
                    <Badge 
                      className={
                        offer.conversionRate >= 80 ? 'bg-green-400/20 text-green-400' :
                        offer.conversionRate >= 60 ? 'bg-yellow-400/20 text-yellow-400' :
                        'bg-red-400/20 text-red-400'
                      }
                    >
                      {formatPercentage(offer.conversionRate)} conversion
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-neutral-400">Usage Count</span>
                      <div className="text-white">{offer.usageCount.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Revenue Impact</span>
                      <div className="text-lime-400">{formatCurrency(offer.revenueImpact)}</div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Discount Given</span>
                      <div className="text-red-400">-{formatCurrency(offer.discountGiven)}</div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Net Impact</span>
                      <div className="text-lime-400">
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
          </Card>

          {/* Offer Type Distribution */}
          <Card className="p-6">
            <h3 className="text-white mb-4 text-lg font-semibold">Offer Usage Distribution</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={offerPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#262626', 
                    border: '1px solid #404040',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Bar dataKey="usageCount" fill="#84cc16" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;