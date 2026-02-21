/**
 * Dashboard Page - Command Center
 * Main overview with KPIs, filters, and recent activities
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { analyticsService, tripService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { MetricCard, GlassCard, LoadingSpinner, StatusBadge, PageHeader } from '@/components/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Truck,
  AlertTriangle,
  Activity,
  Package,
  Filter,
  MapPin,
  Clock,
  TrendingUp,
  Plus
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const canManage = hasRole('FleetManager');
  const canDispatch = hasRole('FleetManager') || hasRole('Dispatcher');

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [error, setError] = useState(null);
  
  // Filter states
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, [vehicleTypeFilter, statusFilter]);

  const fetchDashboardData = async () => {
    try {
      if (!dashboardData) setLoading(true);
      const params = {};
      if (vehicleTypeFilter !== 'all') params.vehicleType = vehicleTypeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const [dashboardRes, tripsRes] = await Promise.all([
        analyticsService.getDashboard(params),
        tripService.getAll({ ...params, limit: 5 })
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
        action={
          <div className="flex items-center gap-3">
            {canDispatch && (
              <button
                onClick={() => navigate('/trips')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl',
                  'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]',
                  'text-white font-medium shadow-lg shadow-purple-500/25',
                  'hover:from-[#6D28D9] hover:to-[#5B21B6]',
                  'transition-all duration-200'
                )}
              >
                <Plus className="w-5 h-5" />
                New Trip
              </button>
            )}
            {canManage && (
              <button
                onClick={() => navigate('/vehicles')}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl',
                  'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]',
                  'text-white font-medium shadow-lg shadow-purple-500/25',
                  'hover:from-[#6D28D9] hover:to-[#5B21B6]',
                  'transition-all duration-200'
                )}
              >
                <Plus className="w-5 h-5" />
                New Vehicle
              </button>
            )}
          </div>
        }
      />

      {/* Filters Section */}
      <GlassCard className="mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Vehicle Type Filter */}
          <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30 focus:border-purple-500/50 rounded-xl backdrop-blur-sm">
              <SelectValue placeholder="All Vehicles" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20 text-white">
              <SelectItem value="all">All Vehicles</SelectItem>
              <SelectItem value="Truck">Truck</SelectItem>
              <SelectItem value="Van">Van</SelectItem>
              <SelectItem value="Bike">Bike</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30 focus:border-purple-500/50 rounded-xl backdrop-blur-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20 text-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="OnTrip">On Trip</SelectItem>
              <SelectItem value="InShop">In Shop</SelectItem>
            </SelectContent>
          </Select>

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
                    ₹{costs.fuel?.total?.toLocaleString('en-IN') || 0}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-xs text-gray-400 mb-1">Maintenance</p>
                  <p className="text-lg font-semibold text-white">
                    ₹{costs.maintenance?.total?.toLocaleString('en-IN') || 0}
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <p className="text-xs text-purple-300 mb-1">Total Operational Cost</p>
                <p className="text-xl font-bold text-purple-400">
                  ₹{costs.totalOperationalCost?.toLocaleString('en-IN') || 0}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
