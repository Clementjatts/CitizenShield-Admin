import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicHeader from '../components/layout/PublicHeader';
import Home from '../pages/Home';
import AuthPage from '../views/auth/AuthPage';
import AdminDashboard from '../pages/AdminDashboard';
import ContactUs from '../pages/ContactUs';
import EmergencyContacts from '../pages/EmergencyContacts';
import EmergencyGuide from '../pages/EmergencyGuide';
import ReportIncident from '../pages/ReportIncident';
import CommunitySupport from '../pages/CommunitySupport';
import SafeLocations from '../pages/SafeLocations';
import FirstAidTips from '../pages/FirstAidTips';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';
  const isDashboardPage = location.pathname === '/dashboard';

  return (
    <AuthProvider>
      {!isAuthPage && !isDashboardPage && (
        <PublicHeader
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/emergency-contacts" element={<EmergencyContacts />} />
        <Route path="/emergency-guide" element={<EmergencyGuide />} />
        <Route path="/report-incident" element={<ReportIncident />} />
        <Route path="/community-support" element={<CommunitySupport />} />
        <Route path="/safe-locations" element={<SafeLocations />} />
        <Route path="/first-aid-tips" element={<FirstAidTips />} />
        <Route path="/auth" element={<AuthPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard setIsAuthenticated={setIsAuthenticated} />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;