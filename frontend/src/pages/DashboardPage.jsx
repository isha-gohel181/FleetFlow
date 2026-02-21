/**
 * Dashboard Page - Command Center
 * Main overview with KPIs, filters, and recent activities
 */
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { analyticsService, tripService } from '@/services';
import { MetricCard, GlassCard, LoadingSpinner, StatusBadge, PageHeader } from '@/components/common';
import {
  Truck,
  AlertTriangle,
  Activity,
  Package,
  Filter,
  Calendar,
  ChevronDown,
  MapPin,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [error, setError] = useState(null);
  
  // Filter states
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, tripsRes] = await Promise.all([
        analyticsService.getDashboard(),
        tripService.getAll({ limit: 5 })
      ]);
      setDashboardData(dashboardRes.data);
      setRecentTrips(tripsRes.data.trips);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const { vehicles, drivers, trips, costs } = dashboardData;

  // Calculate metrics
  const activeFleet = (vehicles.byStatus?.Available || 0) + (vehicles.byStatus?.OnTrip || 0);
  const maintenanceAlerts = vehicles.byStatus?.InShop || 0;
  const utilizationRate = vehicles.total > 0 
    ? Math.round(((vehicles.byStatus?.OnTrip || 0) / vehicles.total) * 100) 
    : 0;
  const pendingCargo = trips.byStatus?.Draft || 0;

  return (
    <div>
      <PageHeader 
        title="Command Center" 
        description="Fleet overview and real-time statistics"
      />

      {/* Filters Section */}
      <GlassCard className="mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Vehicle Type Filter */}
          <div className="relative">
            <select
              value={vehicleTypeFilter}
              onChange={(e) => setVehicleTypeFilter(e.target.value)}
              className={cn(
                'appearance-none pl-4 pr-10 py-2 rounded-xl',
                'bg-white/5 border border-white/10',
                'text-white text-sm',
                'focus:outline-none focus:border-purple-500/50',
                'cursor-pointer'
              )}
            >
              <option value="all">All Vehicles</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Bike">Bike</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={cn(
                'appearance-none pl-4 pr-10 py-2 rounded-xl',
                'bg-white/5 border border-white/10',
                'text-white text-sm',
                'focus:outline-none focus:border-purple-500/50',
                'cursor-pointer'
              )}
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="OnTrip">On Trip</option>
              <option value="InShop">In Shop</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Date Filter (optional) */}
          <button
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl',
              'bg-white/5 border border-white/10',
              'text-gray-400 text-sm',
              'hover:bg-white/10 hover:text-white',
              'transition-all duration-200'
            )}
          >
            <Calendar className="w-4 h-4" />
            Last 7 days
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </GlassCard>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Active Fleet - Primary Card */}
        <MetricCard
          title="Active Fleet"
          value={activeFleet}
          subtitle={`${vehicles.total} total vehicles`}
          trend="up"
          trendValue="+12%"
          icon={Truck}
          variant="primary"
        />

        {/* Maintenance Alerts */}
        <MetricCard
          title="Maintenance Alerts"
          value={maintenanceAlerts}
          subtitle="Vehicles in shop"
          trend={maintenanceAlerts > 2 ? 'down' : 'up'}
          trendValue={maintenanceAlerts > 2 ? '+3' : '-2'}
          icon={AlertTriangle}
          variant="glass"
        />

        {/* Utilization Rate */}
        <MetricCard
          title="Utilization Rate"
          value={`${utilizationRate}%`}
          subtitle="Fleet efficiency"
          trend="up"
          trendValue="+5%"
          icon={Activity}
          variant="glass"
        />

        {/* Pending Cargo */}
        <MetricCard
          title="Pending Cargo"
          value={pendingCargo}
          subtitle="Draft trips"
          trend={pendingCargo > 5 ? 'down' : 'up'}
          trendValue={pendingCargo > 5 ? '+8' : '-3'}
          icon={Package}
          variant="glass"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trips */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Trips</h3>
            <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              View all
            </button>
          </div>

          <div className="space-y-4">
            {recentTrips.length > 0 ? (
              recentTrips.map((trip) => (
                <div
                  key={trip._id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {trip.fromLocation} → {trip.toLocation}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {trip.vehicle?.name || 'Unknown Vehicle'} • {trip.driver?.name || 'Unknown Driver'}
                    </p>
                  </div>
                  <StatusBadge status={trip.status} />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-8">No recent trips</p>
            )}
          </div>
        </GlassCard>

        {/* Fleet Status Overview */}
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Fleet Status</h3>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>

          <div className="space-y-4">
            {/* Vehicle Types Distribution */}
            <div className="space-y-3">
              <p className="text-sm text-gray-400">By Vehicle Type</p>
              {Object.entries(vehicles.byType || {}).map(([type, count]) => (
                <div key={type} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white">{type}</span>
                      <span className="text-sm text-gray-400">{count}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] rounded-full"
                        style={{ width: `${(count / vehicles.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-4" />

            {/* Driver Status */}
            <div className="space-y-3">
              <p className="text-sm text-gray-400">Driver Status</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm text-green-400">
                    {drivers.byStatus?.Available || 0} Available
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm text-blue-400">
                    {drivers.byStatus?.OnDuty || 0} On Duty
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-sm text-amber-400">
                    {drivers.expiringLicenses || 0} Expiring Licenses
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-4" />

            {/* Cost Summary */}
            <div className="space-y-3">
              <p className="text-sm text-gray-400">Operational Costs</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-400 mb-1">Fuel Costs</p>
                  <p className="text-lg font-semibold text-white">
                    ${costs.fuel?.total?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-400 mb-1">Maintenance</p>
                  <p className="text-lg font-semibold text-white">
                    ${costs.maintenance?.total?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <p className="text-xs text-purple-300 mb-1">Total Operational Cost</p>
                <p className="text-xl font-bold text-purple-400">
                  ${costs.totalOperationalCost?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
