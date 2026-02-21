/**
 * Analytics Page
 * Fleet-wide performance metrics and cost analysis
 */
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
  BarChart3,
  TrendingUp,
  TrendingDown,
  Droplets,
  Truck,
  Wrench,
  DollarSign,
  PieChart,
  Activity,
  AlertCircle
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

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Fleet Analytics" 
        description="Deep dive into your operational efficiency and cost structures"
      />

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Op. Cost"
          value={`$${costs.totalOperationalCost.toLocaleString()}`}
          subtitle="Fuel + Maintenance"
          icon={DollarSign}
          variant="primary"
        />
        <MetricCard
          title="Avg. Efficiency"
          value={`${(trips.completed?.totalDistance / costs.fuel?.totalLiters || 0).toFixed(2)}`}
          subtitle="km per Liter"
          icon={Activity}
          variant="glass"
        />
        <MetricCard
          title="Fleet Size"
          value={vehicles.total}
          subtitle="Active Vehicles"
          icon={Truck}
          variant="glass"
        />
        <MetricCard
          title="Cargo Delivered"
          value={`${(trips.completed?.totalCargoWeight / 1000 || 0).toFixed(1)}t`}
          subtitle="Tonnes total weight"
          icon={TrendingUp}
          variant="glass"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cost Breakdown */}
        <GlassCard>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              Cost Distribution
            </h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fuel Expenditure</span>
                <span className="text-white font-medium">${costs.fuel.total.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(costs.fuel.total / costs.totalOperationalCost) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Maintenance & Repairs</span>
                <span className="text-white font-medium">${costs.maintenance.total.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(costs.maintenance.total / costs.totalOperationalCost) * 100}%` }}
                />
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <div>
                  <p className="text-xs text-purple-300">Total Expenditure</p>
                  <p className="text-2xl font-bold text-white">${costs.totalOperationalCost.toLocaleString()}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-purple-400/50" />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Vehicle Performance Ranking */}
        <GlassCard>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Fuel Efficiency Leaderboard
            </h3>
          </div>

          <div className="space-y-4">
            {fuelReport.slice(0, 5).map((item, index) => (
              <div 
                key={item.vehicle.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-8 font-bold text-gray-500 text-center">#{index + 1}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.vehicle.name}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{item.vehicle.licensePlate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-400">
                    {item.fuelEfficiency ? `${item.fuelEfficiency} km/L` : 'N/A'}
                  </p>
                  <p className="text-[10px] text-gray-500">{item.totalDistance.toLocaleString()} km total</p>
                </div>
              </div>
            ))}
            {fuelReport.length === 0 && (
              <p className="text-center text-gray-500 py-12">No performance data available yet.</p>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Fleet Utilization */}
      <GlassCard>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Operational Capacity
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-2xl bg-white/5">
            <p className="text-gray-400 text-sm mb-1">Fleet Utilization</p>
            <p className="text-3xl font-bold text-white">
              {vehicles.total > 0 ? Math.round(((vehicles.byStatus?.OnTrip || 0) / vehicles.total) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500 mt-2">Active vehicles vs total</p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-white/5">
            <p className="text-gray-400 text-sm mb-1">Maintenance Burden</p>
            <p className="text-3xl font-bold text-amber-500">
              {vehicles.total > 0 ? Math.round(((vehicles.byStatus?.InShop || 0) / vehicles.total) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500 mt-2">Percentage currently in shop</p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-white/5">
            <p className="text-gray-400 text-sm mb-1">Trip Success Rate</p>
            <p className="text-3xl font-bold text-blue-500">
              {trips.total > 0 ? Math.round(((trips.byStatus?.Completed || 0) / (trips.total - (trips.byStatus?.Draft || 0))) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500 mt-2">Completed vs scheduled trips</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
