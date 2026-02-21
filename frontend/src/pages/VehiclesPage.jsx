/**
 * Vehicle Registry Page
 * CRUD operations for fleet vehicles with modal form
 */
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { vehicleService } from '@/services';
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
  Pencil,
  Trash2,
  X,
  Truck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react';

export default function VehiclesPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('FleetManager');

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    licensePlate: '',
    vehicleType: 'Truck',
    maxCapacity: '',
    odometer: ''
  });

  useEffect(() => {
    fetchVehicles();
  }, [pagination.current, statusFilter, typeFilter]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = { 
        page: pagination.current, 
        limit: 10
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.vehicleType = typeFilter;
      
      const response = await vehicleService.getAll(params);
      setVehicles(response.data.vehicles);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        name: vehicle.name,
        licensePlate: vehicle.licensePlate,
        vehicleType: vehicle.vehicleType,
        maxCapacity: vehicle.maxCapacity.toString(),
        odometer: vehicle.odometer.toString()
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        name: '',
        licensePlate: '',
        vehicleType: 'Truck',
        maxCapacity: '',
        odometer: ''
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const data = {
        ...formData,
        maxCapacity: parseFloat(formData.maxCapacity),
        odometer: parseFloat(formData.odometer) || 0
      };

      if (editingVehicle) {
        await vehicleService.update(editingVehicle._id, data);
      } else {
        await vehicleService.create(data);
      }
      
      closeModal();
      fetchVehicles();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Are you sure you want to delete "${vehicle.name}"?`)) {
      return;
    }

    try {
      await vehicleService.delete(vehicle._id);
      fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  // Filter vehicles by search query
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && vehicles.length === 0) {
    return <LoadingSpinner fullScreen text="Loading vehicles..." />;
  }

  return (
    <div>
      <PageHeader 
        title="Vehicle Registry" 
        description="Manage your fleet vehicles"
        action={
          canManage && (
            <button
              onClick={() => openModal()}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl',
                'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]',
                'text-white font-medium shadow-lg shadow-purple-500/25',
                'hover:from-[#6D28D9] hover:to-[#5B21B6]',
                'transition-all duration-200'
              )}
            >
              <Plus className="w-5 h-5" />
              Add Vehicle
            </button>
          )
        }
      />

      {/* Filters */}
      <GlassCard className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-xl',
                'bg-white/5 border border-white/10',
                'text-white placeholder-gray-500 text-sm',
                'focus:outline-none focus:border-purple-500/50'
              )}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination(p => ({ ...p, current: 1 }));
            }}
            className={cn(
              'px-4 py-2.5 rounded-xl appearance-none',
              'bg-white/10 border border-white/20',
              'text-white text-sm font-medium cursor-pointer',
              'hover:bg-white/15 hover:border-white/30',
              'focus:outline-none focus:border-purple-500/50 focus:bg-white/15',
              'transition-all duration-200 backdrop-blur-sm'
            )}
          >
            <option value="all">All Status</option>
            <option value="Available">Available</option>
            <option value="OnTrip">On Trip</option>
            <option value="InShop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPagination(p => ({ ...p, current: 1 }));
            }}
            className={cn(
              'px-4 py-2.5 rounded-xl appearance-none',
              'bg-white/10 border border-white/20',
              'text-white text-sm font-medium cursor-pointer',
              'hover:bg-white/15 hover:border-white/30',
              'focus:outline-none focus:border-purple-500/50 focus:bg-white/15',
              'transition-all duration-200 backdrop-blur-sm'
            )}
          >
            <option value="all">All Types</option>
            <option value="Truck">Truck</option>
            <option value="Van">Van</option>
            <option value="Bike">Bike</option>
          </select>
        </div>
      </GlassCard>

      {/* Vehicles Table */}
      <GlassCard padding={false}>
        {error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        ) : filteredVehicles.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No vehicles found"
            description="Add your first vehicle to get started."
            action={
              canManage && (
                <button
                  onClick={() => openModal()}
                  className="px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                >
                  Add Vehicle
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
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Name</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">License Plate</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Type</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Capacity (kg)</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Odometer (km)</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                    {canManage && (
                      <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((vehicle) => (
                    <tr 
                      key={vehicle._id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Truck className="w-4 h-4 text-purple-400" />
                          </div>
                          <span className="text-white font-medium">{vehicle.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-300 font-mono">{vehicle.licensePlate}</td>
                      <td className="py-4 px-6 text-gray-300">{vehicle.vehicleType}</td>
                      <td className="py-4 px-6 text-gray-300">{vehicle.maxCapacity.toLocaleString()}</td>
                      <td className="py-4 px-6 text-gray-300">{vehicle.odometer.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <StatusBadge status={vehicle.status} />
                      </td>
                      {canManage && (
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal(vehicle)}
                              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(vehicle)}
                              disabled={vehicle.status === 'OnTrip' || vehicle.status === 'InShop'}
                              className={cn(
                                'p-2 rounded-lg transition-all',
                                vehicle.status === 'OnTrip' || vehicle.status === 'InShop'
                                  ? 'text-gray-600 cursor-not-allowed'
                                  : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                              )}
                              title={vehicle.status === 'OnTrip' || vehicle.status === 'InShop' 
                                ? 'Cannot delete while in use' 
                                : 'Delete'
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
                Showing {filteredVehicles.length} of {pagination.total} vehicles
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-[#111827] border border-white/10 rounded-2xl shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">
                {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{formError}</p>
                </div>
              )}

              {/* Vehicle Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vehicle Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Heavy Hauler 1"
                  required
                  className={cn(
                    'w-full px-4 py-3 rounded-xl',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder-gray-500',
                    'focus:outline-none focus:border-purple-500/50'
                  )}
                />
              </div>

              {/* License Plate */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  License Plate *
                </label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                  placeholder="e.g., ABC-1234"
                  required
                  className={cn(
                    'w-full px-4 py-3 rounded-xl',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder-gray-500 uppercase',
                    'focus:outline-none focus:border-purple-500/50'
                  )}
                />
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vehicle Type *
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl',
                    'bg-white/10 border border-white/20',
                    'text-white font-medium cursor-pointer',
                    'hover:bg-white/15 hover:border-white/30',
                    'focus:outline-none focus:border-purple-500/50 focus:bg-white/15',
                    'transition-all duration-200'
                  )}
                >
                  <option value="Truck">Truck</option>
                  <option value="Van">Van</option>
                  <option value="Bike">Bike</option>
                </select>
              </div>

              {/* Max Capacity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Capacity (kg) *
                </label>
                <input
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value })}
                  placeholder="e.g., 20000"
                  required
                  min="0"
                  step="0.01"
                  className={cn(
                    'w-full px-4 py-3 rounded-xl',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder-gray-500',
                    'focus:outline-none focus:border-purple-500/50'
                  )}
                />
              </div>

              {/* Odometer */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Odometer (km)
                </label>
                <input
                  type="number"
                  value={formData.odometer}
                  onChange={(e) => setFormData({ ...formData, odometer: e.target.value })}
                  placeholder="e.g., 150000"
                  min="0"
                  step="0.01"
                  className={cn(
                    'w-full px-4 py-3 rounded-xl',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder-gray-500',
                    'focus:outline-none focus:border-purple-500/50'
                  )}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className={cn(
                    'flex-1 py-3 rounded-xl font-medium',
                    'bg-white/5 text-gray-300',
                    'hover:bg-white/10 hover:text-white',
                    'transition-all duration-200'
                  )}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className={cn(
                    'flex-1 py-3 rounded-xl font-medium',
                    'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9]',
                    'text-white shadow-lg shadow-purple-500/25',
                    'hover:from-[#6D28D9] hover:to-[#5B21B6]',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    'transition-all duration-200'
                  )}
                >
                  {formLoading ? 'Saving...' : editingVehicle ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
