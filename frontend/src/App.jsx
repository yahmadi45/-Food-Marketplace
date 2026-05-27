import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import MainLayout from './layout/MainLayout.jsx';
import AdminLayout from './layout/AdminLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import RestaurantPage from './pages/RestaurantPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminRestaurants from './pages/admin/AdminRestaurants.jsx';
import AdminPlats from './pages/admin/AdminPlats.jsx';
import AdminCommandes from './pages/admin/AdminCommandes.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminStatistics from './pages/admin/AdminStatistics.jsx';

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Chargement…</div>;
  if (!user) return <Navigate to="/connexion" replace />;
  return children;
}

function AdminOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Chargement…</div>;
  if (!user) return <Navigate to="/connexion" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="restaurant/:id" element={<RestaurantPage />} />
        <Route path="connexion" element={<LoginPage />} />
        <Route path="inscription" element={<RegisterPage />} />
        <Route
          path="checkout"
          element={
            <Private>
              <CheckoutPage />
            </Private>
          }
        />
      </Route>
      <Route
        path="/admin"
        element={
          <AdminOnly>
            <AdminLayout />
          </AdminOnly>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="restaurants" element={<AdminRestaurants />} />
        <Route path="plats" element={<AdminPlats />} />
        <Route path="commandes" element={<AdminCommandes />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="statistiques" element={<AdminStatistics />} />
      </Route>
    </Routes>
  );
}
