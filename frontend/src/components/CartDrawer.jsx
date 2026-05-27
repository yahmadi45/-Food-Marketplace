import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function CartDrawer({ open, onClose }) {
  const cart = useCart();
  const { user } = useAuth();

  if (!open) return null;

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 100,
        }}
      />
      <aside
        className="card"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: 'min(420px, 100%)',
          zIndex: 101,
          margin: 0,
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slide 0.2s ease',
        }}
      >
        <style>{`@keyframes slide { from { transform: translateX(100%); } to { transform: none; } }`}</style>
        <div className="row" style={{ justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #334155' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Panier</h2>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
          {cart.items.length === 0 ? (
            <p className="muted">Votre panier est vide.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {cart.items.map((x) => (
                <li
                  key={x.plat_id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '56px 1fr auto',
                    gap: '0.75rem',
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    borderBottom: '1px solid #2a3544',
                  }}
                >
                  {x.image ? (
                    <img alt="" src={x.image} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: 8, background: '#334155' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600 }}>{x.nom}</div>
                    <div className="muted">{x.prix.toFixed(3)} TND × {x.quantite}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                    <div className="row" style={{ gap: '0.25rem' }}>
                      <button type="button" className="btn btn-ghost" style={{ padding: '0.25rem 0.55rem' }} onClick={() => cart.dec(x.plat_id)}>−</button>
                      <span>{x.quantite}</span>
                      <button type="button" className="btn btn-ghost" style={{ padding: '0.25rem 0.55rem' }} onClick={() => cart.inc(x.plat_id)}>+</button>
                    </div>
                    <button type="button" className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} onClick={() => cart.removeItem(x.plat_id)}>
                      Retirer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #334155' }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Sous-total</span>
            <span>{cart.subtotal.toFixed(3)} TND</span>
          </div>
          <div className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            Frais de livraison estimés&nbsp;: {cart.fraisLivraison.toFixed(3)} TND
          </div>
          <div className="row" style={{ justifyContent: 'space-between', fontWeight: 700, marginBottom: '1rem' }}>
            <span>Total</span>
            <span>{cart.total.toFixed(3)} TND</span>
          </div>
          <button type="button" className="btn btn-ghost" style={{ width: '100%', marginBottom: '0.5rem' }} onClick={onClose}>
            Continuer les achats
          </button>
          {user ? (
            <Link to="/checkout" onClick={onClose} style={{ display: 'block' }}>
              <button type="button" className="btn btn-primary" style={{ width: '100%' }} disabled={!cart.items.length}>
                Valider la commande
              </button>
            </Link>
          ) : (
            <Link to="/connexion" onClick={onClose} style={{ display: 'block' }}>
              <button type="button" className="btn btn-primary" style={{ width: '100%' }}>
                Connexion pour commander
              </button>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
