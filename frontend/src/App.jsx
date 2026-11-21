import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import MainLayout from './layout/MainLayout.jsx';
import AdminLayout from './layout/AdminLayout.jsx';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const RestaurantPage = lazy(() => import('./pages/RestaurantPage.jsx'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'));
const MyOrdersPage = lazy(() => import('./pages/MyOrdersPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const AdminRestaurants = lazy(() => import('./pages/admin/AdminRestaurants.jsx'));
const AdminPlats = lazy(() => import('./pages/admin/AdminPlats.jsx'));
const AdminCommandes = lazy(() => import('./pages/admin/AdminCommandes.jsx'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers.jsx'));
const AdminStatistics = lazy(() => import('./pages/admin/AdminStatistics.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

function RouteLoading() {
  return <div className="container" role="status" style={{ padding: '4rem 0', textAlign: 'center' }}>Chargement de la page…</div>;
}

function AccessGuard({ children, admin = false }) {
  const { user, loading } = useAuth();
  if (loading) return <RouteLoading />;
  if (!user) return <Navigate to="/connexion" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="restaurant/:id" element={<RestaurantPage />} />
          <Route path="commandes" element={<AccessGuard><MyOrdersPage /></AccessGuard>} />
          <Route path="connexion" element={<LoginPage />} />
          <Route path="inscription" element={<RegisterPage />} />
          <Route path="checkout" element={<AccessGuard><CheckoutPage /></AccessGuard>} />
        </Route>
        <Route path="/admin" element={<AccessGuard admin><AdminLayout /></AccessGuard>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="restaurants" element={<AdminRestaurants />} />
          <Route path="plats" element={<AdminPlats />} />
          <Route path="commandes" element={<AdminCommandes />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="statistiques" element={<AdminStatistics />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
