import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DatabaseProvider } from './context/DatabaseContext';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Operational Core Pages
import { PatientListPage } from './pages/PatientListPage';
import { PatientRegisterPage } from './pages/PatientRegisterPage';
import { PatientProfilePage } from './pages/PatientProfilePage';
import { DoctorListPage } from './pages/DoctorListPage';
import { AddDoctorPage } from './pages/AddDoctorPage';
import { AppointmentListPage } from './pages/AppointmentListPage';
import { BookAppointmentPage } from './pages/BookAppointmentPage';

// Role Dashboards
import { AdminDashboard } from './pages/AdminDashboard';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ReportsPage } from './pages/ReportsPage';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { ReceptionistDashboard } from './pages/ReceptionistDashboard';
import { ConsultationFormPage } from './pages/ConsultationFormPage';

// Pharmacy Module
import { InventoryListPage } from './pages/InventoryListPage';
import { PrescriptionQueuePage } from './pages/PrescriptionQueuePage';

// Billing Module
import { InvoiceListPage } from './pages/InvoiceListPage';
import { CreateInvoicePage } from './pages/CreateInvoicePage';
import { InvoicePrintView } from './pages/InvoicePrintView';

// Shared Components
import { Card } from './components/Card';
import { ShieldAlert, User, LogOut, LayoutDashboard } from 'lucide-react';

// Unauthorized Page
const UnauthorizedPage: React.FC = () => {
  const { logout } = useAuth();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px' }}>
      <Card title="Permission Denied" subtitle="Access restriction warning" style={{ maxWidth: '400px', textAlign: 'center' }}>
        <ShieldAlert size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
          Your active system role does not have authorization to view this endpoint.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" style={{ display: 'inline-flex' }}>
            <button className="hms-btn hms-btn-primary" style={{ height: '36px' }}>Back to Home</button>
          </Link>
          <button className="hms-btn hms-btn-outline" style={{ height: '36px' }} onClick={() => logout()}>Sign Out</button>
        </div>
      </Card>
    </div>
  );
};

// NotFound Page
const NotFoundPage: React.FC = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px' }}>
    <Card title="404 - Page Not Found" subtitle="Requested resource doesn't exist" style={{ maxWidth: '400px', textAlign: 'center' }}>
      <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
        The link you followed is broken or the page has been moved.
      </p>
      <Link to="/">
        <button className="hms-btn hms-btn-primary">Return to Workspace</button>
      </Link>
    </Card>
  </div>
);

// Sprint Placeholder view
const SprintPlaceholder: React.FC<{ title: string }> = ({ title }) => (
  <Card title={`${title} Panel`} subtitle="Scheduled Deliverable Module">
    <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
      <LayoutDashboard size={48} style={{ color: '#2563eb', marginBottom: '16px' }} />
      <h3>Module Coming Soon</h3>
      <p style={{ marginTop: '8px', fontSize: '0.9rem' }}>
        The operational views for <strong>{title}</strong> will be activated during the upcoming sprint releases (Sprint Days 4-13).
      </p>
    </div>
  </Card>
);

// Root Redirect component to auto-route to correct dashboard based on user role
const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'Admin':
      return <Navigate to="/dashboard" replace />;
    case 'Doctor':
      return <Navigate to="/schedules" replace />;
    case 'Receptionist':
      return <Navigate to="/registration" replace />;
    case 'Pharmacist':
      return <Navigate to="/prescriptions" replace />;
    case 'Billing Staff':
      return <Navigate to="/billing" replace />;
    default:
      return <Navigate to="/profile" replace />;
  }
};

const DashboardLayoutWrapper: React.FC<{ activeId: string; children: React.ReactNode }> = ({ activeId, children }) => {
  const [tab, setTab] = React.useState(activeId);
  const navigate = useNavigate();
  
  useEffect(() => {
    setTab(activeId);
  }, [activeId]);

  const handleTabChange = (newTab: string) => {
    const paths: Record<string, string> = {
      overview: '/dashboard',
      staff: '/dashboard',
      doctors: '/doctors',
      inventory: '/inventory',
      audit: '/audit-logs',
      reports: '/reports',
      settings: '/settings',
      profile: '/profile',
      schedules: '/schedules',
      patients: '/patients',
      registration: '/registration',
      appointments: '/appointments',
      prescriptions: '/prescriptions',
      billing: '/billing',
      financials: '/billing'
    };
    
    const targetPath = paths[newTab] || '/';
    navigate(targetPath);
  };

  return (
    <DashboardLayout activeTab={tab} setActiveTab={handleTabChange}>
      {children}
    </DashboardLayout>
  );
};

export const App: React.FC = () => {
  return (
    <DatabaseProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Root handler */}
            <Route path="/" element={<RootRedirect />} />

            {/* Print Views (No layout wrapper) */}
            <Route path="/invoice/print/:invoiceId" element={
              <ProtectedRoute allowedRoles={['Admin', 'Billing Staff']}>
                <InvoicePrintView />
              </ProtectedRoute>
            } />

            {/* Protected Dashboard Routes (Vite React Router v6) */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DashboardLayoutWrapper activeId="overview">
                  <AdminDashboard />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/patients" element={
              <ProtectedRoute allowedRoles={['Admin', 'Receptionist', 'Doctor']}>
                <DashboardLayoutWrapper activeId="patients">
                  <PatientListPage />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/patients/new" element={
              <ProtectedRoute allowedRoles={['Admin', 'Receptionist']}>
                <DashboardLayoutWrapper activeId="patients">
                  <PatientRegisterPage />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/patients/:id" element={
              <ProtectedRoute allowedRoles={['Admin', 'Receptionist', 'Doctor']}>
                <DashboardLayoutWrapper activeId="patients">
                  <PatientProfilePage />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/doctors" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DashboardLayoutWrapper activeId="doctors">
                  <DoctorListPage />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/doctors/new" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DashboardLayoutWrapper activeId="doctors">
                  <AddDoctorPage />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/registration" element={
              <ProtectedRoute allowedRoles={['Admin', 'Receptionist']}>
                <DashboardLayoutWrapper activeId="registration">
                  <ReceptionistDashboard />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/schedules" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DashboardLayoutWrapper activeId="schedules">
                  <DoctorDashboard />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/consultation/:appointmentId" element={
              <ProtectedRoute allowedRoles={['Doctor']}>
                <DashboardLayoutWrapper activeId="schedules">
                  <ConsultationFormPage />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/appointments" element={
              <ProtectedRoute allowedRoles={['Admin', 'Receptionist']}>
                <DashboardLayoutWrapper activeId="appointments">
                  <AppointmentListPage />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/appointments/new" element={
              <ProtectedRoute allowedRoles={['Admin', 'Receptionist']}>
                <DashboardLayoutWrapper activeId="appointments">
                  <BookAppointmentPage />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/prescriptions" element={
              <ProtectedRoute allowedRoles={['Pharmacist']}>
                <DashboardLayoutWrapper activeId="prescriptions">
                  <PrescriptionQueuePage />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/inventory" element={
              <ProtectedRoute allowedRoles={['Admin', 'Pharmacist']}>
                <DashboardLayoutWrapper activeId="inventory">
                  <InventoryListPage />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/billing" element={
              <ProtectedRoute allowedRoles={['Admin', 'Billing Staff']}>
                <DashboardLayoutWrapper activeId="billing">
                  <InvoiceListPage />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/billing/new" element={
              <ProtectedRoute allowedRoles={['Admin', 'Billing Staff']}>
                <DashboardLayoutWrapper activeId="billing">
                  <CreateInvoicePage />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DashboardLayoutWrapper activeId="reports">
                  <ReportsPage />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/audit-logs" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DashboardLayoutWrapper activeId="audit">
                  <AuditLogsPage />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <DashboardLayoutWrapper activeId="settings">
                  <SettingsPage />
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['Admin', 'Doctor', 'Receptionist', 'Pharmacist', 'Billing Staff']}>
                <DashboardLayoutWrapper activeId="profile">
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <h3>User Profile View</h3>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '8px' }}>Manage personal password configurations.</p>
                  </div>
                </DashboardLayoutWrapper>
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </DatabaseProvider>
  );
};

export default App;
