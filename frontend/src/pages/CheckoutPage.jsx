import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const PAY = [
  {
    id: 'livraison',
    label: 'Paiement à la livraison',
    description: 'Réglez votre commande à sa réception.',
    available: true,
  },
  {
    id: 'carte',
    label: 'Carte bancaire',
    description: 'Le paiement par carte en ligne arrive bientôt.',
    available: false,
  },
  {
    id: 'mobile_money',
    label: 'Mobile money',
    description: 'Le paiement mobile arrive bientôt.',
    available: false,
  },
];

export default function CheckoutPage() {
  const { user } = useAuth();
  const cart = useCart();
  const nav = useNavigate();
  const [adresse_livraison, setAddr] = useState('');
  const [telephone_contact, setTel] = useState('');
  const [commentaire, setComment] = useState('');
  const [mode_paiement, setPay] = useState('livraison');
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
      <div className="auth-page">
        <div className="card checkout-success">
          <span className="checkout-success-icon" aria-hidden="true">✓</span>
          <span className="eyebrow">C’est confirmé</span>
          <h1 style={{ margin: '.5rem 0' }}>Commande enregistrée</h1>
          <p>Merci ! Votre commande #{done.commande.id} est enregistrée (statut : en attente).</p>
          <p className="muted">Mode de paiement : {PAY.find((method) => method.id === mode_paiement)?.label}.</p>
          <p className="muted">Total de la commande&nbsp;: {Number(done.commande.total).toFixed(3)} TND</p>
          <Link to="/" className="btn btn-primary">Retour à l’accueil</Link>
        </div>
      </div>
    );
  }

  if (!cart.items.length) {
    return (
      <div className="container empty-state" style={{ minHeight: '55vh' }}>
        <span className="cart-empty-icon" aria-hidden="true">🛍️</span>
        <h1>Votre panier est vide</h1>
        <p>Parcourez les restaurants pour trouver votre prochain repas.</p>
        <Link to="/" className="btn btn-primary">Découvrir les restaurants</Link>
      </div>
    );
  }

  return (
    <div className="container checkout-grid">
      <section className="card checkout-card">
        <span className="eyebrow">Presque arrivé</span>
        <h1>Informations de livraison</h1>
        {err && <p className="checkout-error" role="alert">{err}</p>}
        <form onSubmit={confirm} className="checkout-form">
          <label>
            <span className="muted">Adresse de livraison</span>
            <textarea autoComplete="street-address" required rows={3} value={adresse_livraison} onChange={(e) => setAddr(e.target.value)} />
          </label>
          <label>
            <span className="muted">Numéro de téléphone</span>
            <input type="tel" autoComplete="tel" required value={telephone_contact} onChange={(e) => setTel(e.target.value)} />
          </label>
          <label>
            <span className="muted">Commentaire (optionnel)</span>
            <textarea rows={2} value={commentaire} onChange={(e) => setComment(e.target.value)} />
          </label>

          <fieldset className="payment-method-fieldset">
            <legend>Mode de paiement</legend>
            <div className="payment-options">
              {PAY.map((p) => (
                <label key={p.id} className={`payment-option ${p.available ? '' : 'is-unavailable'}`}>
                  <input
                    type="radio"
                    name="pay"
                    value={p.id}
                    checked={mode_paiement === p.id}
                    disabled={!p.available}
                    onChange={() => setPay(p.id)}
                  />
                  <span className="payment-option-copy">
                    <span className="payment-option-title">{p.label}</span>
                    <span className="payment-option-description">{p.description}</span>
                  </span>
                  <span className="payment-option-state">{p.available ? 'Disponible' : 'Bientôt'}</span>
                </label>
              ))}
            </div>
            <p className="payment-note" role="note">
              Les paiements en ligne ne sont pas encore activés. Aucun montant ne sera débité par carte ou Mobile money.
            </p>
          </fieldset>

          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Envoi…' : 'Confirmer la commande'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => nav(-1)}>
            Retour au panier
          </button>
        </form>
      </section>

      <aside className="card checkout-summary">
        <span className="eyebrow">Votre commande</span>
        <h2>Récapitulatif</h2>
        <ul className="checkout-items">
          {cart.items.map((x) => (
            <li key={x.plat_id} className="checkout-item">
              <span>
                {x.nom} × {x.quantite}
              </span>
              <span>{(x.prix * x.quantite).toFixed(3)}</span>
            </li>
          ))}
        </ul>
        <hr className="checkout-divider" />
        <div className="cart-total-row">
          <span>Sous-total</span><strong>{cart.subtotal.toFixed(3)} TND</strong>
        </div>
        <div className="cart-total-row cart-fee-row">
          <span>Frais de livraison</span><span>{cart.fraisLivraison.toFixed(3)} TND</span>
        </div>
        <div className="cart-total-row cart-grand-total">
          <span>Total estimé</span><strong>{cart.total.toFixed(3)} TND</strong>
        </div>
      </aside>
    </div>
  );
}
