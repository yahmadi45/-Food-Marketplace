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
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh' }}>
      <aside
        className="card"
        style={{ borderRadius: 0, padding: '1rem', borderRight: '1px solid #334155', background: '#151c24' }}
      >
        <div style={{ fontWeight: 700, marginBottom: '1rem', fontFamily: "'Fraunces',serif" }}>Back-office</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={`/admin/${l.to}`}
              style={({ isActive }) => ({
                padding: '0.5rem 0.65rem',
                borderRadius: 8,
                textDecoration: 'none',
                color: 'inherit',
                background: isActive ? '#2a3544' : 'transparent',
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <NavLink to="/" style={{ display: 'block', marginTop: '2rem' }} className="muted">
          ← Front-office
        </NavLink>
      </aside>
      <main style={{ padding: '1.25rem 1.5rem 2rem', overflow: 'auto', background: 'var(--bg)' }}>
        <Outlet />
      </main>
    </div>
  );
}
