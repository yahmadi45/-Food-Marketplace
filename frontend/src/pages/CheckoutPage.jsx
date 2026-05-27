import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const PAY = [
  { id: 'carte', label: 'Carte bancaire' },
  { id: 'livraison', label: 'Paiement à la livraison' },
  { id: 'mobile_money', label: 'Mobile money / wallet' },
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const cart = useCart();
  const nav = useNavigate();
  const [adresse_livraison, setAddr] = useState('');
  const [telephone_contact, setTel] = useState('');
  const [commentaire, setComment] = useState('');
  const [mode_paiement, setPay] = useState('carte');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/auth/me')
      .then(({ data }) => {
        if (cancelled) return;
        if (data.telephone && !telephone_contact) setTel(data.telephone);
        if (data.adresse && !adresse_livraison) setAddr(data.adresse);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const confirm = async (e) => {
    e.preventDefault();
    if (!cart.restaurantId || !cart.items.length) return;
    setBusy(true);
    setErr('');
    try {
      const { data } = await api.post('/commandes', {
        restaurant_id: cart.restaurantId,
        items: cart.items.map((x) => ({ plat_id: x.plat_id, quantite: x.quantite })),
        adresse_livraison,
        telephone_contact,
        commentaire,
        mode_paiement,
      });
      cart.clear();
      setDone(data);
    } catch (ex) {
      setErr(ex.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="container" style={{ maxWidth: 560, paddingTop: '2rem' }}>
        <div className="card" style={{ padding: '1.75rem' }}>
          <h1 style={{ marginTop: 0 }}>Commande confirmée</h1>
          <p>Merci ! Votre commande #{done.commande.id} est enregistrée (statut : en attente).</p>
          <p className="muted">Total payé&nbsp;: {Number(done.commande.total).toFixed(3)} TND</p>
          <Link to="/">
            <button type="button" className="btn btn-primary">
              Retour à l’accueil
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
        <p>Panier vide.</p>
        <Link to="/">Continuer vos achats</Link>
      </div>
    );
  }

  return (
    <div
      className="container checkout-grid"
      style={{
        paddingTop: '2rem',
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: 'minmax(0,1fr) minmax(260px, 360px)',
        alignItems: 'start',
      }}
    >
      <style>{`
        @media (max-width: 900px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ marginTop: 0 }}>Informations de livraison</h2>
        {err && <p style={{ color: 'var(--danger)' }}>{err}</p>}
        <form onSubmit={confirm} style={{ display: 'grid', gap: '1rem' }}>
          <label>
            <span className="muted">Adresse de livraison</span>
            <textarea required rows={3} style={{ width: '100%', marginTop: '0.35rem' }} value={adresse_livraison} onChange={(e) => setAddr(e.target.value)} />
          </label>
          <label>
            <span className="muted">Numéro de téléphone</span>
            <input required style={{ width: '100%', marginTop: '0.35rem' }} value={telephone_contact} onChange={(e) => setTel(e.target.value)} />
          </label>
          <label>
            <span className="muted">Commentaire (optionnel)</span>
            <textarea rows={2} style={{ width: '100%', marginTop: '0.35rem' }} value={commentaire} onChange={(e) => setComment(e.target.value)} />
          </label>

          <h3 style={{ marginBottom: '0.25rem' }}>Paiement</h3>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {PAY.map((p) => (
              <label key={p.id} className="row" style={{ cursor: 'pointer' }}>
                <input type="radio" name="pay" checked={mode_paiement === p.id} onChange={() => setPay(p.id)} />
                {p.label}
              </label>
            ))}
          </div>

          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Envoi…' : 'Confirmer la commande'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => nav(-1)}>
            Retour au panier
          </button>
        </form>
      </div>

      <aside className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ marginTop: 0 }}>Récapitulatif</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {cart.items.map((x) => (
            <li key={x.plat_id} style={{ marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
              <span>
                {x.nom} × {x.quantite}
              </span>
              <span>{(x.prix * x.quantite).toFixed(3)}</span>
            </li>
          ))}
        </ul>
        <hr style={{ border: 'none', borderTop: '1px solid #334155' }} />
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span>Sous-total</span>
          <span>{cart.subtotal.toFixed(3)} TND</span>
        </div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span>Frais de livraison</span>
          <span>{cart.fraisLivraison.toFixed(3)} TND</span>
        </div>
        <div className="row" style={{ justifyContent: 'space-between', fontWeight: 700, marginTop: '0.5rem' }}>
          <span>Total</span>
          <span>{cart.total.toFixed(3)} TND</span>
        </div>
      </aside>
    </div>
  );
}
