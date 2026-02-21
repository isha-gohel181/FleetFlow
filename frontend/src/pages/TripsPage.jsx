/**
 * Trip Management Page
 * Handles trip planning, dispatching, and completion
 */
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { tripService, vehicleService, driverService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { 
  GlassCard, 
  StatusBadge, 
  LoadingSpinner, 
  EmptyState,
  PageHeader 
} from '@/components/common';
import {
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  MapPin,
  Truck,
  User,
  Package,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function TripsPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole(['FleetManager', 'Dispatcher']);

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  
  // Create Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Complete Modal states (for odometer entry)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedTripForComplete, setSelectedTripForComplete] = useState(null);
  const [endOdometer, setEndOdometer] = useState('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    vehicle: '',
    driver: '',
    cargoWeight: '',
    fromLocation: '',
    toLocation: '',
    startOdometer: ''
  });

  useEffect(() => {
    fetchTrips();
  }, [pagination.current, statusFilter]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const params = { 
        page: pagination.current, 
        limit: 10
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const response = await tripService.getAll(params);
      setTrips(response.data.trips);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = async () => {
    setFormLoading(true);
    setIsModalOpen(true);
    setFormError('');
    try {
      const [vRes, dRes] = await Promise.all([
        vehicleService.getAll({ status: 'Available', limit: 100 }),
        driverService.getAll({ status: 'Available', limit: 100 })
      ]);
      setAvailableVehicles(vRes.data.vehicles);
      setAvailableDrivers(dRes.data.drivers);
    } catch (err) {
      setFormError('Failed to load available vehicles or drivers');
    } finally {
      setFormLoading(false);
    }
  };

  const handleVehicleChange = (vehicleId) => {
    const vehicle = availableVehicles.find(v => v._id === vehicleId);
    setFormData({
      ...formData,
      vehicle: vehicleId,
      startOdometer: vehicle ? vehicle.odometer : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      await tripService.create(formData);
      setIsModalOpen(false);
      fetchTrips();
      // Reset form
      setFormData({
        vehicle: '',
        driver: '',
        cargoWeight: '',
        fromLocation: '',
        toLocation: '',
        startOdometer: ''
      });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateStatus = async (tripId, status, odometer = null) => {
    try {
      await tripService.updateStatus(tripId, status, odometer);
      fetchTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update trip status');
    }
  };

  const openCompleteModal = (trip) => {
    setSelectedTripForComplete(trip);
    setEndOdometer(trip.startOdometer);
    setIsCompleteModalOpen(true);
  };

  if (loading && trips.length === 0) {
    return <LoadingSpinner fullScreen text="Loading trips..." />;
  }

  return (
    <div>
      <PageHeader 
        title="Trip Management" 
        description="Dispatch and track your cargo deliveries"
        action={
          canManage && (
            <button
              onClick={openAddModal}
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
          )
        }
      />

      {/* Filters */}
      <GlassCard className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400 mr-2">
            <Info className="w-4 h-4" />
            <span className="text-sm">Filter by status:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'Draft', 'Dispatched', 'Completed', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-sm transition-all",
                  statusFilter === status 
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Trips Table/Cards */}
      <GlassCard padding={false}>
        {error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        ) : trips.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No trips found"
            description="Start planning your first delivery trip."
            action={
              canManage && (
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                >
                  Plan Trip
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Route</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Vehicle & Driver</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Cargo</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                    {canManage && (
                      <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {trips.map((trip) => (
                    <tr 
                      key={trip._id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-sm text-white font-medium">{trip.fromLocation}</span>
                          </div>
                          <div className="w-[1px] h-3 bg-white/10 ml-[7px]" />
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-sm text-white font-medium">{trip.toLocation}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-200">{trip.vehicle?.name} ({trip.vehicle?.licensePlate})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs text-gray-200">{trip.driver?.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-amber-400" />
                          <span className="text-sm text-gray-200">{trip.cargoWeight.toLocaleString()} kg</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={trip.status} />
                      </td>
                      {canManage && (
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            {trip.status === 'Draft' && (
                              <button
                                onClick={() => handleUpdateStatus(trip._id, 'Dispatched')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-xs font-medium"
                              >
                                <Play className="w-3.5 h-3.5" />
                                Dispatch
                              </button>
                            )}
                            {trip.status === 'Dispatched' && (
                              <button
                                onClick={() => openCompleteModal(trip)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all text-xs font-medium"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Complete
                              </button>
                            )}
                            {(trip.status === 'Draft' || trip.status === 'Dispatched') && (
                              <button
                                onClick={() => handleUpdateStatus(trip._id, 'Cancelled')}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                title="Cancel Trip"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Showing {trips.length} of {pagination.total} trips
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, current: p.current - 1 }))}
                  disabled={pagination.current === 1}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    pagination.current === 1
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-400">
                  Page {pagination.current} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPagination(p => ({ ...p, current: p.current + 1 }))}
                  disabled={pagination.current === pagination.pages}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    pagination.current === pagination.pages
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </GlassCard>

      {/* Plan New Trip Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Plan New Delivery Trip</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white"><XCircle className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {formError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle *</label>
                  <select
                    value={formData.vehicle}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 hover:border-white/30 focus:border-purple-500/50 focus:bg-white/15 outline-none transition-all duration-200"
                  >
                    <option value="">Select available vehicle</option>
                    {availableVehicles.map(v => (
                      <option key={v._id} value={v._id}>{v.name} ({v.licensePlate} - Max {v.maxCapacity}kg)</option>
                    ))}
                  </select>
                </div>

                {/* Driver Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Driver *</label>
                  <select
                    value={formData.driver}
                    onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/15 hover:border-white/30 focus:border-purple-500/50 focus:bg-white/15 outline-none transition-all duration-200"
                  >
                    <option value="">Select available driver</option>
                    {availableDrivers.map(d => (
                      <option key={d._id} value={d._id}>{d.name} (Cat {d.licenseCategory})</option>
                    ))}
                  </select>
                </div>

                {/* Locations */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">From (Origin) *</label>
                  <input
                    type="text"
                    value={formData.fromLocation}
                    onChange={(e) => setFormData({ ...formData, fromLocation: e.target.value })}
                    placeholder="Warehouse A"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">To (Destination) *</label>
                  <input
                    type="text"
                    value={formData.toLocation}
                    onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
                    placeholder="Distribution Hub B"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
                  />
                </div>

                {/* Cargo and Odometer */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cargo Weight (kg) *</label>
                  <input
                    type="number"
                    value={formData.cargoWeight}
                    onChange={(e) => setFormData({ ...formData, cargoWeight: e.target.value })}
                    placeholder="2500"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Current Odometer (km) *</label>
                  <input
                    type="number"
                    value={formData.startOdometer}
                    onChange={(e) => setFormData({ ...formData, startOdometer: e.target.value })}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-gray-400 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-600 disabled:opacity-50"
                >
                  {formLoading ? 'Creating...' : 'Create Trip Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Trip Modal */}
      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCompleteModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Complete Delivery Trip</h2>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-gray-400 mb-1">Trip Route</p>
                <p className="text-sm text-white">{selectedTripForComplete?.fromLocation} → {selectedTripForComplete?.toLocation}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">End Odometer Reading (km) *</label>
                <input
                  type="number"
                  value={endOdometer}
                  onChange={(e) => setEndOdometer(e.target.value)}
                  min={selectedTripForComplete?.startOdometer}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-purple-500/50"
                  autoFocus
                />
                <p className="text-[11px] text-gray-500 mt-2"> Must be ≥ {selectedTripForComplete?.startOdometer} km</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsCompleteModalOpen(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateStatus(selectedTripForComplete._id, 'Completed', parseFloat(endOdometer));
                  setIsCompleteModalOpen(false);
                }}
                className="flex-1 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600"
              >
                Finish Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
