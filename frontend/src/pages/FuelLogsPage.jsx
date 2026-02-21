/**
 * Fuel Logs Page
 * Track fuel efficiency and costs
 */
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { fuelService, vehicleService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { 
  GlassCard, 
  LoadingSpinner, 
  EmptyState,
  PageHeader 
} from '@/components/common';
import {
  Plus,
  Fuel,
  Droplets,
  DollarSign,
  Calendar,
  Truck,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X
} from 'lucide-react';

export default function FuelLogsPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole(['FleetManager', 'Dispatcher']);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    vehicle: '',
    liters: '',
    cost: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.current]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fuelService.getAll({ 
        page: pagination.current, 
        limit: 10 
      });
      setLogs(response.data.fuelLogs);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load fuel logs');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = async () => {
    setIsModalOpen(true);
    setFormLoading(true);
    try {
      const response = await vehicleService.getAll({ limit: 100 });
      setAvailableVehicles(response.data.vehicles);
    } catch (err) {
      setFormError('Failed to load vehicles');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      await fuelService.create(formData);
      setIsModalOpen(false);
      fetchLogs();
      // Reset form
      setFormData({
        vehicle: '',
        liters: '',
        cost: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create fuel log');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading && logs.length === 0) {
    return <LoadingSpinner fullScreen text="Loading fuel logs..." />;
  }

  return (
    <div>
      <PageHeader 
        title="Fuel Logs" 
        description="Monitor fuel consumption and operational costs"
        action={
          canManage && (
            <button
              onClick={openAddModal}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl',
                'bg-gradient-to-r from-emerald-500 to-teal-600',
                'text-white font-medium shadow-lg shadow-emerald-500/25',
                'hover:from-emerald-600 hover:to-teal-700 transition-all'
              )}
            >
              <Plus className="w-5 h-5" />
              Add Fuel Entry
            </button>
          )
        }
      />

      <GlassCard padding={false}>
        {error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={Fuel}
            title="No fuel data"
            description="Start tracking your fuel costs by adding your first entry."
            action={
              canManage && (
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  Add Entry
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
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Vehicle</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Fuel Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Total Cost</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Avg. Price</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr 
                      key={log._id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <Truck className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{log.vehicle?.name}</span>
                            <span className="text-xs text-gray-400">{log.vehicle?.licensePlate}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-200">
                          <Droplets className="w-4 h-4 text-blue-400" />
                          <span className="text-sm font-medium">{log.liters.toLocaleString()} L</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-emerald-400 font-bold">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>{log.cost.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-400 text-sm">
                        ${(log.cost / log.liters).toFixed(2)} / L
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs">{new Date(log.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Showing {logs.length} of {pagination.total} records
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, current: p.current - 1 }))}
                  disabled={pagination.current === 1}
                  className={cn(
                    'p-2 rounded-lg transition-all',
                    pagination.current === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-white/10'
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
                    pagination.current === pagination.pages ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </GlassCard>

      {/* Add Fuel Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">New Fuel Entry</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Vehicle *</label>
                <select
                  value={formData.vehicle}
                  onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-emerald-500/50"
                >
                  <option value="">Select vehicle</option>
                  {availableVehicles.map(v => (
                    <option key={v._id} value={v._id}>{v.name} ({v.licensePlate})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Amount (Liters) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.liters}
                    onChange={(e) => setFormData({ ...formData, liters: e.target.value })}
                    placeholder="50.0"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Total Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="75.0"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Entry Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
