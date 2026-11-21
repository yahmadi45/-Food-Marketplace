import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: 'dashboard', label: 'Dashboard' },
  { to: 'restaurants', label: 'Restaurants' },
  { to: 'plats', label: 'Plats' },
  { to: 'commandes', label: 'Commandes' },
  { to: 'users', label: 'Utilisateurs' },
  { to: 'statistiques', label: 'Statistiques' },
];

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink to="/admin/dashboard" className="admin-brand">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>Food Marketplace</span>
        </NavLink>
        <nav className="admin-nav" aria-label="Navigation administration">
          {links.map((link) => (
            <NavLink key={link.to} to={`/admin/${link.to}`}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/" className="admin-back-link">
          ← Retour à la boutique
        </NavLink>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
