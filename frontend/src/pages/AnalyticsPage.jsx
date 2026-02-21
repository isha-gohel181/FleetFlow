import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { analyticsService } from '@/services';
import { 
  GlassCard, 
  LoadingSpinner, 
  PageHeader,
  MetricCard
} from '@/components/common';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Droplets,
  Truck,
  Wrench,
  IndianRupee,
  PieChart,
  Activity,
  AlertCircle,
  FileText,
  Download
} from 'lucide-react';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [fuelReport, setFuelReport] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [dashRes, fuelRes] = await Promise.all([
        analyticsService.getDashboard(),
        analyticsService.getFuelEfficiency()
      ]);
      setDashboardData(dashRes.data);
      setFuelReport(fuelRes.data.report || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Calculating fleet metrics..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold text-white mb-2">Analysis Failed</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button 
          onClick={fetchAnalytics}
          className="px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { vehicles, costs, trips } = dashboardData;

  // Custom Chart Components
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1F2937] border border-white/20 p-3 rounded-lg shadow-2xl">
          <p className="text-gray-300 text-sm font-semibold mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-bold mb-1" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Cost') || entry.name.includes('Revenue') 
                ? formatCurrency(entry.value) 
                : entry.name.includes('Efficiency') ? `${entry.value} km/L` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Fleet Analytics" 
        description="Deep dive into your operational efficiency and cost structures"
        action={
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-sm font-medium">
              <Download className="w-4 h-4" />
              Reports
            </button>
          </div>
        }
      />

      {/* 1. Metric Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="border-emerald-500/20 bg-emerald-500/5">
          <div className="flex flex-col items-center justify-center py-2">
            <p className="text-emerald-400 font-medium mb-2">Total Fuel Cost</p>
            <p className="text-3xl font-bold text-white">{formatCurrency(costs.fuel.total)}</p>
          </div>
        </GlassCard>

        <GlassCard className="border-blue-500/20 bg-blue-500/5">
          <div className="flex flex-col items-center justify-center py-2">
            <p className="text-blue-400 font-medium mb-2">Fleet ROI</p>
            <p className="text-3xl font-bold text-white">
              {costs.roi > 0 ? '+' : ''}{costs.roi}%
            </p>
          </div>
        </GlassCard>

        <GlassCard className="border-purple-500/20 bg-purple-500/5">
          <div className="flex flex-col items-center justify-center py-2">
            <p className="text-purple-400 font-medium mb-2">Utilization Rate</p>
            <p className="text-3xl font-bold text-white">{costs.utilizationRate}%</p>
          </div>
        </GlassCard>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Fuel Efficiency Trend */}
        <GlassCard>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">Fuel Efficiency Trend (km/L)</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={costs.trends}>
                <defs>
                  <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="fuelEfficiency" 
                  name="Efficiency"
                  stroke="#7C3AED" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorEfficiency)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Top 5 Costliest Vehicles */}
        <GlassCard>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">Top 5 Costliest Vehicles</h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costs.costByVehicle} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="#94a3b8" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  width={80}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{ backgroundColor: 'transparent', border: 'none' }}
                  wrapperStyle={{ outline: 'none' }}
                />
                <Bar 
                  dataKey="totalCost" 
                  name="Total Cost"
                  fill="#F59E0B" 
                  radius={[0, 4, 4, 0]} 
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* 3. Financial Summary Table */}
      <GlassCard title="Financial Summary of Month" padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-6 text-sm font-medium text-purple-400">Month</th>
                <th className="py-4 px-6 text-sm font-medium text-purple-400">Revenue</th>
                <th className="py-4 px-6 text-sm font-medium text-purple-400">Fuel Cost</th>
                <th className="py-4 px-6 text-sm font-medium text-purple-400">Maintenance</th>
                <th className="py-4 px-6 text-sm font-medium text-purple-400">Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {costs.trends.map((row, idx) => (
                <tr 
                  key={idx}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-6 text-white font-medium">{row.month}</td>
                  <td className="py-4 px-6 text-emerald-400 font-medium">{formatCurrency(row.revenue)}</td>
                  <td className="py-4 px-6 text-red-400">{formatCurrency(row.fuelCost)}</td>
                  <td className="py-4 px-6 text-amber-400">{formatCurrency(row.maintenanceCost)}</td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "font-bold",
                      row.netProfit >= 0 ? "text-emerald-500" : "text-red-500"
                    )}>
                      {formatCurrency(row.netProfit)}
                    </span>
                  </td>
                </tr>
              ))}
              {costs.trends.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500">No financial data available for the period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
