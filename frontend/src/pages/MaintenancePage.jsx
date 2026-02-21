/**
 * Maintenance Logs Page
 * Track vehicle repairs and service history
 */
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { maintenanceService, vehicleService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { 
  GlassCard, 
  StatusBadge, 
  LoadingSpinner, 
  EmptyState,
  PageHeader 
} from '@/components/common';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Wrench,
  CheckCircle2,
  Calendar,
  Truck,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FileText,
  X,
  Pencil,
  Trash2
} from 'lucide-react';

export default function MaintenancePage() {
  const { hasRole } = useAuth();
  const canManage = hasRole(['FleetManager', 'SafetyOfficer']);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    vehicle: '',
    description: '',
    cost: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.current]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await maintenanceService.getAll({ 
        page: pagination.current, 
        limit: 10 
      });
      setLogs(response.data.maintenanceLogs);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load maintenance logs');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = async () => {
    setEditingLog(null);
    setIsModalOpen(true);
    setFormLoading(true);
    try {
      const response = await vehicleService.getAll({ 
        status: ['Available', 'InShop'], // Can add maintenance to available or already in shop
        limit: 100 
      });
      setAvailableVehicles(response.data.vehicles);
    } catch (err) {
      setFormError('Failed to load vehicles');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = async (log) => {
    setEditingLog(log);
    setFormData({
      vehicle: log.vehicle._id,
      description: log.description,
      cost: log.cost,
      date: new Date(log.date).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
    setFormLoading(true);
    try {
      const response = await vehicleService.getAll({ 
        status: ['Available', 'InShop'],
        limit: 100 
      });
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
      if (editingLog) {
        await maintenanceService.update(editingLog._id, formData);
      } else {
        await maintenanceService.create(formData);
      }
      setIsModalOpen(false);
      setEditingLog(null);
      fetchLogs();
      // Reset form
      setFormData({
        vehicle: '',
        description: '',
        cost: '',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      setFormError(err.response?.data?.message || `Failed to ${editingLog ? 'update' : 'create'} log`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (log) => {
    if (!confirm(`Are you sure you want to delete this maintenance log for ${log.vehicle.name}?`)) {
      return;
    }

    try {
      await maintenanceService.delete(log._id);
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete maintenance log');
    }
  };

  const handleComplete = async (logId) => {
    try {
      await maintenanceService.complete(logId);
      fetchLogs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete maintenance');
    }
  };

  if (loading && logs.length === 0) {
    return <LoadingSpinner fullScreen text="Loading maintenance logs..." />;
  }

  return (
    <div>
      <PageHeader 
        title="Maintenance Logs" 
        description="Track vehicle repairs, services, and operational health"
        action={
          canManage && (
            <button
              onClick={openAddModal}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl',
                'bg-gradient-to-r from-amber-500 to-orange-600',
                'text-white font-medium shadow-lg shadow-amber-500/25',
                'hover:from-amber-600 hover:to-orange-700 transition-all'
              )}
            >
              <Plus className="w-5 h-5" />
              Log Maintenance
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
            icon={Wrench}
            title="No maintenance history"
            description="Your fleet is currently healthy. No maintenance logs found."
            action={
              canManage && (
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                >
                  Log Maintenance
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
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Description</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Cost</th>
                    {canManage && (
                      <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
                    )}
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
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                            <Truck className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{log.vehicle?.name}</span>
                            <span className="text-xs text-gray-400">{log.vehicle?.licensePlate}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-200 max-w-xs">{log.description}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{new Date(log.date).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1 text-emerald-400 font-medium">
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>{log.cost.toLocaleString('en-IN')}</span>
                        </div>
                      </td>
                      {canManage && (
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(log)}
                              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(log)}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {log.vehicle?.status === 'InShop' && (
                              <button
                                onClick={() => handleComplete(log._id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all text-xs font-medium ml-2"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Ready
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
                Showing {logs.length} of {pagination.total} logs
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

      {/* Log Maintenance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {editingLog ? 'Edit Maintenance Log' : 'Log Maintenance Activity'}
              </h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingLog(null);
                  setFormData({
                    vehicle: '',
                    description: '',
                    cost: '',
                    date: new Date().toISOString().split('T')[0]
                  });
                }} 
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vehicle * {editingLog && <span className="text-xs text-gray-500">(cannot be changed)</span>}
                </label>
                <Select 
                  value={formData.vehicle} 
                  onValueChange={(value) => setFormData({ ...formData, vehicle: value })}
                  disabled={editingLog}
                >
                  <SelectTrigger className={cn(
                    "w-full bg-white/10 border-white/20 text-white focus:border-amber-500/50 rounded-xl h-12",
                    editingLog ? "opacity-60 cursor-not-allowed" : "hover:bg-white/15 hover:border-white/30"
                  )}>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/20 text-white">
                    {availableVehicles.map(v => (
                      <SelectItem key={v._id} value={v._id}>{v.name} ({v.licensePlate})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Service Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the maintenance or repair..."
                  required
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Cost (₹) *</label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="250"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingLog(null);
                    setFormData({
                      vehicle: '',
                      description: '',
                      cost: '',
                      date: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 disabled:opacity-50"
                >
                  {formLoading ? 'Submitting...' : (editingLog ? 'Update Log' : 'Submit Log')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
