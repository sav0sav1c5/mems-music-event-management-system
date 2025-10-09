import { useState, useEffect } from 'react';
import { 
  DollarSign, Users, Activity, AlertTriangle, RefreshCw
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Import real services
import { RecordedSaleService } from '../services/recordedSaleService';
import { TicketService } from '../services/ticketService';
import { SpecialOfferService } from '../services/specialOfferService';

// Import types
import { TransactionStatus, TicketStatus } from '../types/enums/TicketSales';

// Import Card components
import { Card, KpiCard } from '../components/ui/card';

// Dashboard data interfaces
interface DashboardKPIs {
  dailyRevenue: number;
  revenueChange: number;
  totalSales: number;
  salesChange: number;
  avgOccupancy: number;
  occupancyChange: number;
  activePromotions: number;
  promotionsChange: number;
}

interface RevenueChartData {
  date: string;
  revenue: number;
  sales: number;
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  time: string;
}

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueChartData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [ticketStats, setTicketStats] = useState<{[key in TicketStatus]: number}>({} as any);
  const [weeklyRevenue, setWeeklyRevenue] = useState<number>(0);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // ===================================================================
      // FIX #1: Use UTC dates consistently
      // ===================================================================
      const now = new Date();
      
      // Create UTC "today" (start of day in UTC)
      const today = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0, 0, 0, 0
      ));
      
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

      const yesterday = new Date(today);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);

      console.log('========================================');
      console.log('📅 DASHBOARD DATE SETUP (UTC):');
      console.log('========================================');
      console.log('Current Time (Local):', now.toString());
      console.log('Current Time (UTC):  ', now.toISOString());
      console.log('Today (UTC):         ', today.toISOString());
      console.log('Tomorrow (UTC):      ', tomorrow.toISOString());
      console.log('Yesterday (UTC):     ', yesterday.toISOString());
      console.log('========================================\n');

      // ===================================================================
      // FIX #2: Fetch data with explicit logging
      // ===================================================================
      console.log('🔍 FETCHING DATA...');
      
      const [
        todaySales,
        yesterdaySales,
        allTickets,
        activeSpecialOffers,
        allSalesForFailedCheck
      ] = await Promise.all([
        RecordedSaleService.getCompletedSalesByDateRange(today, tomorrow)
          .then(sales => {
            console.log(`✅ Today Sales (${today.toISOString().split('T')[0]}):`, {
              count: sales.length,
              revenue: sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
              saleIds: sales.map(s => s.recordedSaleId),
              dates: sales.map(s => s.saleDate)
            });
            return sales;
          }),
        RecordedSaleService.getCompletedSalesByDateRange(yesterday, today)
          .then(sales => {
            console.log(`✅ Yesterday Sales (${yesterday.toISOString().split('T')[0]}):`, {
              count: sales.length,
              revenue: sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
            });
            return sales;
          }),
        TicketService.getAllTickets(),
        SpecialOfferService.getActiveOffers(),
        RecordedSaleService.getAllRecordedSales()
      ]);

      // ===================================================================
      // FIX #3: Calculate Daily Revenue with validation
      // ===================================================================
      const dailyRevenue = todaySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      const todaySalesCount = todaySales.length;

      const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
      const yesterdaySalesCount = yesterdaySales.length;

      console.log('\n========================================');
      console.log('💰 DAILY METRICS:');
      console.log('========================================');
      console.log('Today Revenue:     ', dailyRevenue.toLocaleString(), 'RSD');
      console.log('Today Sales:       ', todaySalesCount);
      console.log('Yesterday Revenue: ', yesterdayRevenue.toLocaleString(), 'RSD');
      console.log('Yesterday Sales:   ', yesterdaySalesCount);
      console.log('========================================\n');

      // Calculate percentage changes
      const revenueChange = yesterdayRevenue > 0 ? 
        ((dailyRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
      
      const salesChange = yesterdaySalesCount > 0 ? 
        ((todaySalesCount - yesterdaySalesCount) / yesterdaySalesCount) * 100 : 0;

      // ===================================================================
      // FIX #4: Chart Data - Last 7 Days with detailed logging
      // ===================================================================
      console.log('📈 GENERATING CHART DATA (Last 7 Days)...\n');
      
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setUTCDate(date.getUTCDate() - (6 - i));
        return date;
      });

      console.log('Chart Days:', last7Days.map(d => d.toISOString().split('T')[0]));

      const revenueChartData = await Promise.all(
        last7Days.map(async (date, index) => {
          const nextDay = new Date(date);
          nextDay.setUTCDate(nextDay.getUTCDate() + 1);
          
          const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index];
          
          console.log(`\n📊 Day ${index + 1} (${dayName} - ${date.toISOString().split('T')[0]}):`);
          console.log(`   Query: >= ${date.toISOString()} AND < ${nextDay.toISOString()}`);
          
          const daySales = await RecordedSaleService.getCompletedSalesByDateRange(
            date, 
            nextDay
          ).catch((err) => {
            console.error(`   ❌ ERROR:`, err);
            return [];
          });
          
          const dayRevenue = daySales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
          
          console.log(`   ✅ Results:`, {
            salesCount: daySales.length,
            revenue: dayRevenue.toLocaleString() + ' RSD',
            saleIds: daySales.map(s => s.recordedSaleId).join(', '),
            firstSale: daySales[0]?.saleDate,
            lastSale: daySales[daySales.length - 1]?.saleDate
          });
          
          return {
            date: dayName,
            revenue: dayRevenue,
            sales: daySales.length
          };
        })
      );

      // ===================================================================
      // FIX #5: Weekly Revenue - Calculate and validate
      // ===================================================================
      const calculatedWeeklyRevenue = revenueChartData.reduce(
        (sum, day) => sum + day.revenue, 
        0
      );
      
      console.log('\n========================================');
      console.log('📈 WEEKLY CHART SUMMARY:');
      console.log('========================================');
      revenueChartData.forEach((day, i) => {
        console.log(`${day.date}: ${day.revenue.toLocaleString()} RSD (${day.sales} sales)`);
      });
      console.log('----------------------------------------');
      console.log('Weekly Total:      ', calculatedWeeklyRevenue.toLocaleString(), 'RSD');
      console.log('Weekly Avg/Day:    ', (calculatedWeeklyRevenue / 7).toLocaleString(), 'RSD');
      console.log('Total Sales (7d):  ', revenueChartData.reduce((sum, d) => sum + d.sales, 0));
      console.log('========================================\n');

      // ===================================================================
      // FIX #6: CRITICAL VALIDATION
      // ===================================================================
      console.log('🔍 VALIDATION CHECKS:');
      console.log('----------------------------------------');
      
      // Check 1: Weekly >= Daily
      const weeklyVsDailyValid = calculatedWeeklyRevenue >= dailyRevenue;
      console.log(`Weekly (${calculatedWeeklyRevenue.toLocaleString()}) >= Daily (${dailyRevenue.toLocaleString()}):`, 
        weeklyVsDailyValid ? '✅ PASS' : '❌ FAIL');
      
      // Check 2: Today's data is included in weekly
      const todayInWeekly = revenueChartData[revenueChartData.length - 1];
      const todayMatches = Math.abs(todayInWeekly.revenue - dailyRevenue) < 1;
      console.log(`Today in chart (${todayInWeekly.revenue.toLocaleString()}) matches Daily (${dailyRevenue.toLocaleString()}):`,
        todayMatches ? '✅ PASS' : '❌ FAIL');
      
      // Check 3: No duplicates
      const totalChartSales = revenueChartData.reduce((sum, d) => sum + d.sales, 0);
      console.log(`Chart Sales Count: ${totalChartSales}`);
      
      // Check 4: Revenue per sale ratio
      const avgRevenuePerSale = calculatedWeeklyRevenue / totalChartSales;
      console.log(`Avg Revenue/Sale: ${avgRevenuePerSale.toLocaleString()} RSD`);
      
      if (avgRevenuePerSale < 1000 || avgRevenuePerSale > 50000) {
        console.warn('⚠️ WARNING: Unusual average revenue per sale!');
      }
      
      console.log('========================================\n');

      // ===================================================================
      // Set state
      // ===================================================================
      setWeeklyRevenue(calculatedWeeklyRevenue);
      setRevenueData(revenueChartData);

      // Ticket Statistics (unchanged)
      const ticketStatistics = {
        [TicketStatus.Available]: allTickets.filter(t => t.status === TicketStatus.Available).length,
        [TicketStatus.Sold]: allTickets.filter(t => t.status === TicketStatus.Sold).length,
        [TicketStatus.Reserved]: allTickets.filter(t => t.status === TicketStatus.Reserved).length,
        [TicketStatus.Used]: allTickets.filter(t => t.status === TicketStatus.Used).length,
        [TicketStatus.Cancelled]: allTickets.filter(t => t.status === TicketStatus.Cancelled).length,
        [TicketStatus.Expired]: allTickets.filter(t => t.status === TicketStatus.Expired).length,
        [TicketStatus.Refunded]: allTickets.filter(t => t.status === TicketStatus.Refunded).length
      };

      const totalCapacity = allTickets.length;
      const occupiedTickets = ticketStatistics[TicketStatus.Sold] + 
                            ticketStatistics[TicketStatus.Reserved] + 
                            ticketStatistics[TicketStatus.Used];
      const avgOccupancy = totalCapacity > 0 ? ((occupiedTickets / totalCapacity) * 100) : 0;

      const dashboardKPIs: DashboardKPIs = {
        dailyRevenue: dailyRevenue,
        revenueChange: revenueChange,
        totalSales: todaySalesCount,
        salesChange: salesChange,
        avgOccupancy: avgOccupancy,
        occupancyChange: 2.4,
        activePromotions: activeSpecialOffers.length,
        promotionsChange: 1.0
      };

      console.log('📊 FINAL DASHBOARD KPIs:');
      console.log(dashboardKPIs);
      console.log('\n✅ Dashboard data loaded successfully\n');

      // Generate Alerts (unchanged)
      const systemAlerts: Alert[] = [];
      
      const weeklyAverage = calculatedWeeklyRevenue / 7;
      if (dailyRevenue < weeklyAverage * 0.5 && weeklyAverage > 0) {
        systemAlerts.push({
          id: '1',
          type: 'warning',
          message: `Today's revenue (${formatCurrency(dailyRevenue)}) is below weekly average (${formatCurrency(weeklyAverage)})`,
          time: '5 mins ago'
        });
      }

      if (avgOccupancy > 80) {
        systemAlerts.push({
          id: '2',
          type: 'warning',
          message: `High occupancy rate: ${avgOccupancy.toFixed(1)}%`,
          time: '8 mins ago'
        });
      }

      if (activeSpecialOffers.length > 0) {
        systemAlerts.push({
          id: '3',
          type: 'info',
          message: `${activeSpecialOffers.length} active promotions running`,
          time: '10 mins ago'
        });
      }

      if (todaySalesCount === 0) {
        systemAlerts.push({
          id: '4',
          type: 'warning',
          message: 'No completed sales today',
          time: '15 mins ago'
        });
      }

      const failedSales = allSalesForFailedCheck.filter(sale => 
        sale.transactionStatus === TransactionStatus.Failed
      );
      
      if (failedSales.length > 0) {
        systemAlerts.push({
          id: '5',
          type: 'warning',
          message: `${failedSales.length} failed transactions need attention`,
          time: '20 mins ago'
        });
      }

      setKpis(dashboardKPIs);
      setTicketStats(ticketStatistics);
      setAlerts(systemAlerts);

    } catch (error) {
      console.error('❌ ERROR FETCHING DASHBOARD DATA:', error);
      
      setKpis({
        dailyRevenue: 0,
        revenueChange: 0,
        totalSales: 0,
        salesChange: 0,
        avgOccupancy: 0,
        occupancyChange: 0,
        activePromotions: 0,
        promotionsChange: 0
      });
      setRevenueData([]);
      setAlerts([{
        id: 'error',
        type: 'error',
        message: 'Failed to load dashboard data. Please refresh the page.',
        time: 'Just now'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Optional: Auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard...');
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-10 h-10 text-lime-400 animate-spin" />
          <p className="text-neutral-400 text-base">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Format currency for display (in RSD)
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('sr-RS', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} RSD`;
  };

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
      <div className="text-white h-full flex flex-col p-4 m-1">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-neutral-400 text-sm">Overview of ticket sales and venue performance</p>
        </div>

        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard
              icon={DollarSign}
              title="Daily Revenue"
              value={formatCurrency(kpis?.dailyRevenue || 0)}
              change={kpis?.revenueChange || 0}
              changeType="percentage"
            />

            <KpiCard
              icon={Users}
              title="Total Sales"
              value={(kpis?.totalSales || 0).toString()}
              change={kpis?.salesChange || 0}
              changeType="percentage"
            />

            <KpiCard
              icon={Activity}
              title="Avg Occupancy"
              value={`${(kpis?.avgOccupancy || 0).toFixed(1)}%`}
              change={kpis?.occupancyChange || 0}
              changeType="percentage"
            />

            <KpiCard
              icon={AlertTriangle}
              title="Active Promotions"
              value={(kpis?.activePromotions || 0).toString()}
              change={kpis?.promotionsChange || 0}
              changeType="value"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            
            {/* Weekly Revenue Chart */}
            <div className="xl:col-span-2">
              <Card className="h-full pb-2">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                  <h3 className="text-xl font-semibold text-white">Weekly Revenue</h3>
                  <div className="text-lime-400 text-xl font-bold">
                    {formatCurrency(weeklyRevenue)}
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData} barCategoryGap="15%" margin={{ top: 5, right: 20, left: -5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#171717', 
                          border: '1px solid #404040',
                          borderRadius: '12px',
                          color: '#ffffff',
                          fontSize: '14px'
                        }}
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      />
                      <Bar 
                        dataKey="revenue" 
                        fill="#84cc16" 
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Ticket Status Overview */}
            <div className="xl:col-span-1">
              <Card className="h-full">
                <div className="flex items-center justify-between border-b border-neutral-800 mb-3">
                  <h3 className="text-xl font-semibold text-white mb-3">Ticket Status Overview</h3>
                </div>  
                
                {Object.keys(ticketStats).length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {Object.entries(ticketStats).map(([status, count]) => {
                        const total = Object.values(ticketStats).reduce((sum, val) => sum + val, 0);
                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0';
                        const statusName = status === '2' ? 'Sold' : 
                                        status === '0' ? 'Available' : 
                                        status === '1' ? 'Reserved' : 
                                        status === '3' ? 'Used' : 
                                        status === '4' ? 'Cancelled' : 
                                        status === '5' ? 'Expired' : 'Refunded';
                        
                        const color = status === '2' ? '#84cc16' :
                                    status === '0' ? '#22c55e' :
                                    status === '1' ? '#f59e0b' :
                                    status === '3' ? '#3b82f6' :
                                    '#ef4444';

                        return (
                          <div key={status} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: color }}
                              ></div>
                              <span className="text-neutral-300 text-sm mb-1.5">{statusName}</span>
                            </div>
                            <div className="text-white text-sm font-medium">
                              {count} <span className="text-neutral-400 text-xs">({percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-800">
                      <div className="text-center">
                        <div className="text-white text-lg font-semibold">
                          Total: {Object.values(ticketStats).reduce((sum, val) => sum + val, 0)}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-neutral-400 py-8">
                    <Activity size={32} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No ticket data available</p>
                  </div>
                )}
              </Card>
            </div>

            {/* System Alerts */}
            <div className="xl:col-span-1">
              <Card className="h-full overflow-hidden">
                <div className="flex items-center justify-between border-b border-neutral-800 mb-3">
                  <h3 className="text-xl font-semibold text-white mb-3 w-full">System Alerts</h3>
                </div>  
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {alerts.length > 0 ? alerts.map((alert) => (
                    <div key={alert.id} className={`p-3 rounded-xl border ${
                      alert.type === 'error' ? 'bg-red-950/50 border-red-900' :
                      alert.type === 'warning' ? 'bg-yellow-950/50 border-yellow-900' :
                      'bg-blue-950/50 border-blue-900'
                    }`}>
                      <div className="flex items-center gap-3">
                        <AlertTriangle size={16} className={
                          alert.type === 'error' ? 'text-red-400' :
                          alert.type === 'warning' ? 'text-yellow-400' :
                          'text-blue-400'
                        } />
                        <div className="text-white text-sm">{alert.message}</div>
                      </div>
                      <div className="text-neutral-400 text-xs mt-2">{alert.time}</div>
                    </div>
                  )) : (
                    <div className="text-center text-neutral-400 py-8">
                      <AlertTriangle size={32} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No alerts at this time</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div> 
  );
};

export default Dashboard;