/**
 * Registration Page
 * New user registration with role selection
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Truck, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, User, Shield } from 'lucide-react';
import api from '@/services/api';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const roles = [
    { value: 'FleetManager', label: 'Fleet Manager', description: 'Manage fleet operations and vehicles' },
    { value: 'Dispatcher', label: 'Dispatcher', description: 'Assign trips and coordinate deliveries' },
    { value: 'SafetyOfficer', label: 'Safety Officer', description: 'Monitor safety and compliance' },
    { value: 'FinancialAnalyst', label: 'Financial Analyst', description: 'Analyze costs and financials' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRoleSelect = (roleValue) => {
    setFormData({
      ...formData,
      role: roleValue
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      {/* Registration Card */}
      <div className="relative w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">FleetFlow</span>
          </div>
          <p className="text-gray-400">Fleet & Logistics Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
          <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
          <p className="text-gray-400 mb-8">Join FleetFlow to manage your logistics operations</p>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-3">
              <div className="w-5 h-5 text-green-400 flex-shrink-0">✓</div>
              <p className="text-sm text-green-400">Registration successful! Redirecting to login...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className={cn(
                    'w-full pl-12 pr-4 py-3 rounded-xl',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder-gray-500',
                    'focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50',
                    'transition-all duration-200'
                  )}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className={cn(
                    'w-full pl-12 pr-4 py-3 rounded-xl',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder-gray-500',
                    'focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50',
                    'transition-all duration-200'
                  )}
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select Your Role <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleSelect(role.value)}
                    className={cn(
                      'p-4 rounded-xl text-left transition-all duration-200',
                      'border-2',
                      formData.role === role.value
                        ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/10 hover:border-purple-500/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Shield className={cn(
                        'w-5 h-5 mt-0.5',
                        formData.role === role.value ? 'text-purple-400' : 'text-gray-400'
                      )} />
                      <div>
                        <h3 className={cn(
                          'font-semibold mb-1',
                          formData.role === role.value ? 'text-purple-300' : 'text-gray-300'
                        )}>
                          {role.label}
                        </h3>
                        <p className="text-xs text-gray-400">{role.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password (min. 6 characters)"
                  required
                  className={cn(
                    'w-full pl-12 pr-12 py-3 rounded-xl',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder-gray-500',
                    'focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50',
                    'transition-all duration-200'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                  className={cn(
                    'w-full pl-12 pr-12 py-3 rounded-xl',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder-gray-500',
                    'focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50',
                    'transition-all duration-200'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || success}
              className={cn(
                'w-full py-3 px-4 rounded-xl font-semibold',
                'bg-gradient-to-r from-[#7C3AED] to-[#A78BFA]',
                'text-white shadow-lg shadow-purple-500/25',
                'hover:shadow-xl hover:shadow-purple-500/30',
                'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#0F172A]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-all duration-200',
                'flex items-center justify-center gap-2'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : success ? (
                <>Success! Redirecting...</>
              ) : (
                <>Register</>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
