// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SecureShareHomepage from './public/SecureShareHomepage';
import LoginPage           from './public/LoginPage';
import RegisterPage        from './public/RegisterPage';
import OwnerApp            from './app/owner/OwnerApp';
import VendorApp           from './app/vendor/VendorApp';

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

const getSession = () => {
  try {
    const raw = localStorage.getItem('secureShareUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─── Protected Route ──────────────────────────────────────────────────────────
// requiredRole: 'OWNER' | 'VENDOR' | null (any authenticated user)

const ProtectedRoute = ({ children, requiredRole }) => {
  const session = getSession();

  // No session at all → go to login
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Session exists but wrong role → redirect to their correct dashboard
  if (requiredRole && session.role !== requiredRole) {
    const fallback = session.role === 'OWNER' ? '/owner/dashboard' : '/vendor/browse';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/"         element={<SecureShareHomepage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Owner routes — protected, OWNER role only */}
        <Route
          path="/owner/*"
          element={
            <ProtectedRoute requiredRole="OWNER">
              <OwnerApp />
            </ProtectedRoute>
          }
        />

        {/* Vendor routes — protected, VENDOR role only */}
        <Route
          path="/vendor/*"
          element={
            <ProtectedRoute requiredRole="VENDOR">
              <VendorApp />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}