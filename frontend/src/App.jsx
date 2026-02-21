/**
 * FleetFlow Main App Component
 * Sets up routing and auth context
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AppLayout, ProtectedRoute } from '@/components/layout';
import { 
  LoginPage, 
  DashboardPage, 
  VehiclesPage, 
  DriversPage, 
  TripsPage, 
  MaintenancePage, 
  FuelLogsPage, 
  AnalyticsPage 
} from '@/pages';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes with layout */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            {/* Placeholder routes for future pages */}
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/fuel" element={<FuelLogsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Placeholder component for pages not yet implemented
function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <h1 className="text-2xl font-semibold text-white mb-2">{title}</h1>
      <p className="text-gray-400">This page is coming soon.</p>
    </div>
  );
}

export default App;