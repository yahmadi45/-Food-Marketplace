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
              <span className="brand-mark" aria-hidden="true">✳</span>
              <span>Food Marketplace</span>
            </Link>
            <nav className="site-nav" aria-label="Navigation principale">
              <Link className="nav-link" to="/">Découvrir</Link>
              {user?.role === 'admin' && <Link className="nav-link" to="/admin/dashboard">Administration</Link>}
              {!user ? (
                <>
                  <Link to="/connexion"><button type="button" className="btn btn-ghost">Connexion</button></Link>
                  <Link to="/inscription"><button type="button" className="btn btn-primary">Créer un compte</button></Link>
                </>
              ) : (
                <>
                  <span className="nav-user" title={user.nom}>{user.nom}</span>
                  <button type="button" className="btn btn-ghost" onClick={logout}>Déconnexion</button>
                </>
              )}
              <button type="button" className="btn btn-primary" onClick={() => setOpen(true)} aria-label={`Ouvrir le panier, ${cart.count} articles`}>
                Panier <span aria-hidden="true">·</span> {cart.count}
              </button>
            </nav>
          </div>
        </header>
      )}
      <main style={{ paddingBottom: '2rem', minHeight: '70vh' }}><Outlet /></main>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
