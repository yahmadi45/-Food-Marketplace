import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import CartDrawer from '../components/CartDrawer.jsx';
import { useState } from 'react';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const cart = useCart();
  const [open, setOpen] = useState(false);
  const loc = useLocation();

  const hideChrome = ['/connexion', '/inscription'].includes(loc.pathname);

  return (
    <>
      {!hideChrome && (
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            backdropFilter: 'blur(12px)',
            background: 'rgba(15,20,25,0.85)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="container row" style={{ justifyContent: 'space-between', padding: '1rem 0' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <strong style={{ fontFamily: "'Fraunces', serif", fontSize: '1.25rem' }}>
                🍽️ Food Marketplace
              </strong>
            </Link>
            <nav className="row">
              <Link to="/">
                <button type="button" className="btn btn-ghost">
                  Accueil
                </button>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard">
                  <button type="button" className="btn btn-ghost">
                    Administration
                  </button>
                </Link>
              )}
              {!user ? (
                <>
                  <Link to="/connexion">
                    <button type="button" className="btn btn-ghost">
                      Connexion
                    </button>
                  </Link>
                  <Link to="/inscription">
                    <button type="button" className="btn btn-primary">
                      Inscription
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <span className="muted">{user.nom}</span>
                  <button type="button" className="btn btn-ghost" onClick={() => logout()}>
                    Déconnexion
                  </button>
                </>
              )}
              <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
                Panier ({cart.count})
              </button>
            </nav>
          </div>
        </header>
      )}
      <main style={{ paddingBottom: '3rem', minHeight: '70vh' }}>
        <Outlet />
      </main>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
