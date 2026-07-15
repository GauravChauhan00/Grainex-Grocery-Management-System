import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SuperAdminPage from './pages/SuperAdminPage';
import CategoriesPage from './pages/CategoriesPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductsPage from './pages/ProductsPage';
import ReportsPage from './pages/ReportsPage';
import SalesPage from './pages/SalesPage';

function ProtectedStoreRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-state-wrapper">
        <div className="spinner" />
        <span>Verifying secure store access...</span>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'store_owner') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function ProtectedAdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-state-wrapper">
        <div className="spinner" />
        <span>Verifying administration context...</span>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Presentation Layer */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={user.role === 'admin' ? '/super-admin' : '/dashboard'}
              replace
            />
          ) : (
            <LoginPage />
          )
        }
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Super Admin Control Room */}
      <Route
        path="/super-admin"
        element={
          <ProtectedAdminRoute>
            <SuperAdminPage />
          </ProtectedAdminRoute>
        }
      />

      {/* Multi-Tenant Store Workspaces */}
      <Route
        element={
          <ProtectedStoreRoute>
            <Layout />
          </ProtectedStoreRoute>
        }
      >
        {/* We redirect from parent index to dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
