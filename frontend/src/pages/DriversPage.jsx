/**
 * Drivers Registry Page
 * CRUD operations for fleet drivers with modal form
 */
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { driverService } from '@/services';
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
  Pencil,
  Trash2,
  X,
  User,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  Shield,
  CheckCircle,
  MessageSquare
} from 'lucide-react';

export default function DriversPage() {
  const { hasRole } = useAuth();
  const canManage = hasRole('FleetManager');

  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    licenseCategory: 'A',
    licenseNumber: '',
    licenseExpiryDate: '',
    status: 'Available'
  });

  useEffect(() => {
    fetchDrivers();
  }, [pagination.current, statusFilter, searchQuery]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const params = { 
        page: pagination.current, 
        limit: 10
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      
      const response = await driverService.getAll(params);
      setDrivers(response.data.drivers);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (driver = null) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        name: driver.name,
        licenseCategory: driver.licenseCategory,
        licenseNumber: driver.licenseNumber || '',
        licenseExpiryDate: new Date(driver.licenseExpiryDate).toISOString().split('T')[0],
        status: driver.status
      });
    } else {
      setEditingDriver(null);
      setFormData({
        name: '',
        licenseCategory: 'A',
        licenseNumber: '',
        licenseExpiryDate: '',
        status: 'Available'
      });
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDriver(null);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (editingDriver) {
        await driverService.update(editingDriver._id, formData);
      } else {
        await driverService.create(formData);
      }
      
      closeModal();
      fetchDrivers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save driver');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (driver) => {
    if (!window.confirm(`Are you sure you want to delete "${driver.name}"?`)) {
      return;
    }

    try {
      await driverService.delete(driver._id);
      fetchDrivers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete driver');
    }
  };

  // No local filtering needed anymore, but let's keep consistency
  const displayDrivers = drivers;

  if (loading && drivers.length === 0) {
    return <LoadingSpinner fullScreen text="Loading drivers..." />;
  }

  return (
    <div>
      <PageHeader 
        title="Drivers Registry" 
        description="Manage your fleet drivers and licenses"
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
              Add Driver
            </button>
          )
        }
      />

      {/* Filters */}
      <GlassCard className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or license number..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPagination(p => ({ ...p, current: 1 }));
              }}
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-xl',
                'bg-white/5 border border-white/10',
                'text-white placeholder-gray-500 text-sm',
                'focus:outline-none focus:border-purple-500/50'
              )}
            />
          </div>

          {/* Status Filter */}
          <Select 
            value={statusFilter} 
            onValueChange={(value) => {
              setStatusFilter(value);
              setPagination(p => ({ ...p, current: 1 }));
            }}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30 focus:border-purple-500/50 rounded-xl backdrop-blur-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20 text-white">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="OnDuty">On Duty</SelectItem>
              <SelectItem value="Taking a Break">Taking a Break</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      {/* Drivers Table */}
      <GlassCard padding={false}>
        {error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        ) : displayDrivers.length === 0 ? (
          <EmptyState
            icon={User}
            title="No drivers found"
            description="Add your first driver to get started."
            action={
              canManage && (
                <button
                  onClick={() => openModal()}
                  className="px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                >
                  Add Driver
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
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">License Details</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Perf (CR / SS)</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Complaints</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-400">Status</th>
                    {canManage && (
                      <th className="text-right py-4 px-6 text-sm font-medium text-gray-400">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {displayDrivers.map((driver) => {
                    const expiryDate = new Date(driver.licenseExpiryDate);
                    const isExpired = expiryDate < new Date();
                    
                    return (
                      <tr 
                        key={driver._id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-white font-medium">{driver.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-bold border border-white/10 text-purple-300">
                                {driver.licenseCategory}
                              </span>
                              <span className="text-sm text-gray-300">#{driver.licenseNumber || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-gray-500" />
                              <span className={cn(
                                "text-[11px]",
                                isExpired ? "text-red-400 font-bold" : "text-gray-500"
                              )}>
                                Exp: {expiryDate.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                                <CheckCircle className="w-3 h-3" />
                                {driver.completionRate || 0}%
                              </div>
                              <span className="text-[10px] text-gray-500">Completion</span>
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 text-xs text-blue-400 font-medium">
                                <Shield className="w-3 h-3" />
                                {driver.safetyScore || 0}%
                              </div>
                              <span className="text-[10px] text-gray-500">Safety</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center gap-1.5 justify-start">
                            <MessageSquare className={cn(
                              "w-4 h-4",
                              (driver.complaints || 0) > 0 ? "text-amber-400" : "text-gray-600"
                            )} />
                            <span className={cn(
                              "text-sm",
                              (driver.complaints || 0) > 0 ? "text-white font-medium" : "text-gray-500"
                            )}>{driver.complaints || 0}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge status={driver.status} />
                        </td>
                        {canManage && (
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openModal(driver)}
                                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(driver)}
                                disabled={driver.status === 'OnDuty'}
                                className={cn(
                                  'p-2 rounded-lg transition-all',
                                  driver.status === 'OnDuty'
                                    ? 'text-gray-600 cursor-not-allowed'
                                    : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                                )}
                                title={driver.status === 'OnDuty' 
                                  ? 'Cannot delete while on duty' 
                                  : 'Delete'
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <p className="text-sm text-gray-400">
                Showing {displayDrivers.length} of {pagination.total} drivers
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
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          <div className="relative w-full max-w-lg bg-[#111827] border border-white/10 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{formError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Driver Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Robert Johnson"
                  required
                  className={cn(
                    'w-full px-4 py-3 rounded-xl',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder-gray-500',
                    'focus:outline-none focus:border-purple-500/50'
                  )}
                />
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    License Number *
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="e.g., DL-123456789"
                    required
                    className={cn(
                      'w-full px-4 py-3 rounded-xl',
                      'bg-white/5 border border-white/10',
                      'text-white placeholder-gray-500',
                      'focus:outline-none focus:border-purple-500/50'
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      License Category *
                    </label>
                    <Select 
                      value={formData.licenseCategory} 
                      onValueChange={(value) => setFormData({ ...formData, licenseCategory: value })}
                    >
                      <SelectTrigger className="w-full bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30 focus:border-purple-500/50 rounded-xl h-12">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-white/20 text-white">
                        <SelectItem value="A">Category A</SelectItem>
                        <SelectItem value="B">Category B</SelectItem>
                        <SelectItem value="C">Category C</SelectItem>
                        <SelectItem value="D">Category D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="w-full bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30 focus:border-purple-500/50 rounded-xl h-12">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20 text-white">
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="OnDuty">On Duty</SelectItem>
                      <SelectItem value="Taking a Break">Taking a Break</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  License Expiry Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={(e) => setFormData({ ...formData, licenseExpiryDate: e.target.value })}
                    required
                    className={cn(
                      'w-full pl-10 pr-4 py-3 rounded-xl',
                      'bg-white/5 border border-white/10',
                      'text-white',
                      'focus:outline-none focus:border-purple-500/50'
                    )}
                  />
                </div>
              </div>

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
                  {formLoading ? 'Saving...' : editingDriver ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
