import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useApp, AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppModeProvider } from './context/AppModeContext';
import { ProtectedRoute, PublicRoute } from './components/common/ProtectedRoute';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { NotificationCenter } from './components/layout/NotificationCenter';
import { PresentationToolkit } from './components/common/PresentationToolkit';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Spinner, TableSkeleton } from './components/common/Loader';

// Lazy-loaded Pages
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const HospitalDashboard = lazy(() => import('./pages/HospitalDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ChwDashboard = lazy(() => import('./pages/ChwDashboard'));
const CommunityHealthIntel = lazy(() => import('./pages/CommunityHealthIntel'));
const EmergencyCenter = lazy(() => import('./pages/EmergencyCenter'));
const SymptomChecker = lazy(() => import('./pages/SymptomChecker'));
const HealthVault = lazy(() => import('./pages/HealthVault'));
const ReportIntelligence = lazy(() => import('./pages/ReportIntelligence'));
const PharmacyNetwork = lazy(() => import('./pages/PharmacyNetwork'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'));
const HealthTimeline = lazy(() => import('./pages/HealthTimeline'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

interface AppContentProps {
  defaultPage: string;
}

const AppContent: React.FC<AppContentProps> = ({ defaultPage }) => {
  const { role } = useApp();
  const [activePage, setActivePage] = useState<string>(defaultPage);
  const [notifCenterOpen, setNotifCenterOpen] = useState(false);

  useEffect(() => {
    if (defaultPage === 'profile' || defaultPage === 'settings') {
      setActivePage(defaultPage);
      return;
    }
    if (role === 'patient') {
      setActivePage('patient-dashboard');
    } else if (role === 'doctor') {
      setActivePage('doctor-dashboard');
    } else if (role === 'hospital') {
      setActivePage('hospital-dashboard');
    } else if (role === 'admin') {
      setActivePage('admin-dashboard');
    } else if (role === 'chw') {
      setActivePage('chw-dashboard');
    }
  }, [role, defaultPage]);

  const renderActivePage = () => {
    switch (activePage) {
      case 'patient-dashboard':
        return <PatientDashboard />;
      case 'doctor-dashboard':
        return <DoctorDashboard />;
      case 'hospital-dashboard':
        return <HospitalDashboard />;
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'chw-dashboard':
        return <ChwDashboard />;
      case 'community-health-intel':
        return <CommunityHealthIntel />;
      case 'emergency-center':
        return <EmergencyCenter />;
      case 'symptom-checker':
        return <SymptomChecker />;
      case 'appointments':
        return <AppointmentsPage />;
      case 'health-vault':
        return <HealthVault />;
      case 'health-timeline':
        return <HealthTimeline />;
      case 'report-intel':
        return <ReportIntelligence />;
      case 'pharmacy-network':
        return <PharmacyNetwork />;
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <PatientDashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#05070c] text-slate-200">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onOpenNotifications={() => setNotifCenterOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={<TableSkeleton rows={4} />}>
            {renderActivePage()}
          </Suspense>
        </main>
      </div>

      <NotificationCenter isOpen={notifCenterOpen} onClose={() => setNotifCenterOpen(false)} />
      
      <PresentationToolkit />
    </div>
  );
};

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={`/${user.role}`} replace />;
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppModeProvider>
          <ToastProvider>
            <AuthProvider>
              <AppProvider>
                <Suspense fallback={
                  <div className="flex items-center justify-center h-screen bg-[#05070c] text-cyan-400">
                    <Spinner />
                  </div>
                }>
                  <Routes>
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                    
                    <Route
                      path="/patient"
                      element={
                        <ProtectedRoute allowedRoles={['patient']}>
                          <AppContent defaultPage="patient-dashboard" />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/doctor"
                      element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                          <AppContent defaultPage="doctor-dashboard" />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/hospital"
                      element={
                        <ProtectedRoute allowedRoles={['hospital']}>
                          <AppContent defaultPage="hospital-dashboard" />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AppContent defaultPage="admin-dashboard" />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/chw"
                      element={
                        <ProtectedRoute allowedRoles={['chw']}>
                          <AppContent defaultPage="chw-dashboard" />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <AppContent defaultPage="profile" />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <AppContent defaultPage="settings" />
                        </ProtectedRoute>
                      }
                    />
                    
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </AppProvider>
            </AuthProvider>
          </ToastProvider>
        </AppModeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
