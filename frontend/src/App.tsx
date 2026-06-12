import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Purchases from './pages/Purchases';
import Stock from './pages/Stock';
import Cash from './pages/Cash';
import Debts from './pages/Debts';
import Receivables from './pages/Receivables';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Audit from './pages/Audit';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSuccess = (userRole: string) => {
    setToken(localStorage.getItem('token'));
    setRole(userRole);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    setToken(null);
    setRole(null);
  };

  // Helper component to guard routes based on authentication
  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
    if (!token || !role) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(role)) {
      // If role is not allowed, redirect to their default home page
      const defaultPath = ['super_admin', 'owner', 'kasir'].includes(role) ? '/' : '/products';
      
      // Prevent infinite redirect if defaultPath matches the current location
      const currentPath = window.location.pathname;
      if (defaultPath === currentPath || (currentPath === '/' && defaultPath === '/')) {
        localStorage.clear();
        return <Navigate to="/login" replace />;
      }
      return <Navigate to={defaultPath} replace />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route 
          path="/login" 
          element={
            (token && role) ? <Navigate to={['super_admin', 'owner', 'kasir'].includes(role) ? '/' : '/products'} replace /> : <Login onLoginSuccess={handleLoginSuccess} />
          } 
        />

        {/* Protected Application Routes */}
        <Route
          element={
            <ProtectedRoute>
              <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
                <Sidebar role={role || ''} />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Navbar onLogout={handleLogout} />
                  <main className="flex-1 overflow-hidden flex flex-col">
                    <Outlet />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          }
        >
          {/* Dashboard (Admin, Owner, Kasir) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'kasir']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          {/* POS Checkout (Admin, Owner, Kasir) */}
          <Route 
            path="/pos" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'kasir']}>
                <POS />
              </ProtectedRoute>
            } 
          />

          {/* Products Inventory (Admin, Owner, Staff Gudang) */}
          <Route 
            path="/products" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'staff_gudang']}>
                <Products />
              </ProtectedRoute>
            } 
          />

          {/* Categories (Admin, Owner, Staff Gudang) */}
          <Route 
            path="/categories" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'staff_gudang']}>
                <Categories />
              </ProtectedRoute>
            } 
          />

          {/* Suppliers (Admin, Owner, Staff Gudang) */}
          <Route 
            path="/suppliers" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'staff_gudang']}>
                <Suppliers />
              </ProtectedRoute>
            } 
          />

          {/* Customers Loyalty (Admin, Owner, Kasir) */}
          <Route 
            path="/customers" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'kasir']}>
                <Customers />
              </ProtectedRoute>
            } 
          />

          {/* Purchases (Admin, Owner, Staff Gudang) */}
          <Route 
            path="/purchases" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'staff_gudang']}>
                <Purchases />
              </ProtectedRoute>
            } 
          />

          {/* Stock movements (Admin, Owner, Staff Gudang) */}
          <Route 
            path="/stock" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'staff_gudang']}>
                <Stock />
              </ProtectedRoute>
            } 
          />

          {/* Cash ledger (Admin, Owner, Kasir) */}
          <Route 
            path="/cash" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'kasir']}>
                <Cash />
              </ProtectedRoute>
            } 
          />

          {/* Debts (Admin, Owner) */}
          <Route 
            path="/debts" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner']}>
                <Debts />
              </ProtectedRoute>
            } 
          />

          {/* Receivables (Admin, Owner, Kasir) */}
          <Route 
            path="/receivables" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner', 'kasir']}>
                <Receivables />
              </ProtectedRoute>
            } 
          />

          {/* Business Reports (Admin, Owner) */}
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'owner']}>
                <Reports />
              </ProtectedRoute>
            } 
          />

          {/* User Account CRUD (Admin only) */}
          <Route 
            path="/users" 
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <Users />
              </ProtectedRoute>
            } 
          />

          {/* Audit Trail Logs (Admin only) */}
          <Route 
            path="/audit" 
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <Audit />
              </ProtectedRoute>
            } 
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
