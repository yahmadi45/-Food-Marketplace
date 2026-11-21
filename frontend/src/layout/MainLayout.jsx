import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import CartDrawer from '../components/CartDrawer.jsx';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hideChrome = ['/connexion', '/inscription'].includes(location.pathname);

  return (
    <>
      {!hideChrome && (
        <header className="site-header">
          <div className="container site-header-inner">
            <Link to="/" className="brand" aria-label="Food Marketplace, accueil">
              <span className="brand-mark" aria-hidden="true">F</span>
              <span className="brand-copy">
                <strong>Food Marketplace</strong>
                <small>Les bonnes tables, près de chez vous</small>
              </span>
            </Link>
            <nav className="site-nav" aria-label="Navigation principale">
              <Link className="nav-link" to="/">Découvrir</Link>
              {user && <Link className="nav-link" to="/commandes">Mes commandes</Link>}
              {user?.role === 'admin' && <Link className="nav-link" to="/admin/dashboard">Administration</Link>}
              <div className="site-actions">
                {!user ? (
                  <>
                    <Link to="/connexion" className="btn btn-ghost">Connexion</Link>
                    <Link to="/inscription" className="btn btn-primary">Créer un compte</Link>
                  </>
                ) : (
                  <>
                    <span className="nav-user" title={user.nom}>Bonjour, {user.nom}</span>
                    <button type="button" className="btn btn-ghost" onClick={logout}>Déconnexion</button>
                  </>
                )}
              </div>
              <button type="button" className="btn btn-cart" onClick={() => setOpen(true)} aria-label={`Ouvrir le panier, ${cart.count} articles`}>
                <span aria-hidden="true">🛒</span>
                <span>Panier</span>
                <span className="cart-count" aria-hidden="true">{cart.count}</span>
              </button>
            </nav>
          </div>
        </header>
      )}
      <main className="site-main"><Outlet /></main>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
