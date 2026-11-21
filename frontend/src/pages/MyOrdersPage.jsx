import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';

const ORDER_STEPS = [
  { key: 'en_attente', label: 'Reçue' },
  { key: 'confirmee', label: 'Confirmée' },
  { key: 'en_preparation', label: 'Préparation' },
  { key: 'en_livraison', label: 'En route' },
  { key: 'livree', label: 'Livrée' },
];

const STATUS_LABELS = {
  en_attente: 'En attente',
  confirmee: 'Confirmée',
  en_preparation: 'En préparation',
  en_livraison: 'En livraison',
  livree: 'Livrée',
  annulee: 'Annulée',
};

const PAYMENT_LABELS = {
  carte: 'Carte bancaire',
  livraison: 'Paiement à la livraison',
  mobile_money: 'Mobile money',
};

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date indisponible';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function OrderProgress({ status }) {
  if (status === 'annulee') {
    return (
      <p className="order-cancelled" role="status">
        Cette commande a été annulée.
      </p>
    );
  }

  const activeIndex = ORDER_STEPS.findIndex((step) => step.key === status);
  if (activeIndex < 0) {
    return <p className="order-status-note">Le statut détaillé n’est pas disponible pour le moment.</p>;
  }

  return (
    <ol className="order-timeline" aria-label="Progression de la commande">
      {ORDER_STEPS.map((step, index) => (
        <li
          key={step.key}
          className={[
            'order-step',
            index < activeIndex ? 'is-complete' : '',
            index === activeIndex ? 'is-current' : '',
          ].filter(Boolean).join(' ')}
          aria-current={index === activeIndex ? 'step' : undefined}
        >
          <span className="order-step-marker" aria-hidden="true">{index < activeIndex ? '✓' : index + 1}</span>
          <span className="order-step-label">{step.label}</span>
        </li>
      ))}
    </ol>
  );
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/commandes/mine');
      setOrders(data);
    } catch {
      setError('Impossible de charger vos commandes. Réessayez dans un instant.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <section className="container orders-page">
      <div className="orders-heading">
        <div>
          <span className="eyebrow">Votre espace</span>
          <h1>Mes commandes</h1>
          <p>Consultez votre historique et suivez l’avancement de vos commandes.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={loadOrders} disabled={loading}>
          {loading ? 'Actualisation…' : 'Actualiser'}
        </button>
      </div>

      {error && <p className="notice notice-error" role="alert">{error}</p>}

      {loading && orders.length === 0 ? (
        <div className="card orders-empty" role="status">Chargement de vos commandes…</div>
      ) : !error && orders.length === 0 ? (
        <div className="card orders-empty">
          <span className="cart-empty-icon" aria-hidden="true">🧾</span>
          <h2>Aucune commande pour le moment</h2>
          <p>Vos commandes apparaîtront ici dès votre premier achat.</p>
          <Link to="/" className="btn btn-primary">Découvrir les restaurants</Link>
        </div>
      ) : error && orders.length === 0 ? (
        <div className="card orders-empty">
          <h2>Historique indisponible</h2>
          <p>Vos commandes n’ont pas pu être chargées.</p>
          <button type="button" className="btn btn-ghost" onClick={loadOrders}>Réessayer</button>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order) => {
            const label = STATUS_LABELS[order.statut_livraison] || 'Statut indisponible';
            const isCancelled = order.statut_livraison === 'annulee';
            return (
              <article className="card order-card" key={order.id}>
                <header className="order-card-header">
                  <div>
                    <span className="order-reference">Commande #{order.id}</span>
                    <h2>{order.restaurant_nom}</h2>
                  </div>
                  <span className={`order-status ${isCancelled ? 'is-cancelled' : ''}`}>
                    {label}
                  </span>
                </header>

                <div className="order-meta">
                  <span>{formatDate(order.date)}</span>
                  <span>{Number(order.total).toFixed(3)} TND</span>
                  <span>{PAYMENT_LABELS[order.mode_paiement] || 'Paiement'}</span>
                </div>

                <OrderProgress status={order.statut_livraison} />

                <footer className="order-card-footer">
                  <span className="order-status-note">
                    Statut actuel : <strong>{label}</strong>
                  </span>
                  <Link to={`/restaurant/${order.restaurant_id}`} className="order-restaurant-link">
                    Voir le restaurant <span aria-hidden="true">→</span>
                  </Link>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
