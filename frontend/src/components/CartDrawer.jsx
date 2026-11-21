import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function CartDrawer({ open, onClose }) {
  const cart = useCart();
  const { user } = useAuth();

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="cart-drawer-backdrop"
        onClick={onClose}
        aria-label="Fermer le panier"
      />
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="cart-drawer-header">
          <div>
            <p className="eyebrow">Votre sélection</p>
            <h2 id="cart-title">Mon panier <span>({cart.count})</span></h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fermer">
            ×
          </button>
        </div>

        <div className="cart-drawer-content">
          {cart.items.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon" aria-hidden="true">🛍️</span>
              <h3>Votre panier est vide</h3>
              <p>Les plats que vous ajoutez apparaîtront ici.</p>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Découvrir les restaurants
              </button>
            </div>
          ) : (
            <ul className="cart-items">
              {cart.items.map((item) => (
                <li key={item.plat_id} className="cart-item">
                  {item.image ? (
                    <img alt="" src={item.image} className="cart-item-image" />
                  ) : (
                    <div className="cart-item-image cart-item-placeholder" aria-hidden="true">🍽️</div>
                  )}
                  <div className="cart-item-info">
                    <strong>{item.nom}</strong>
                    <span>{item.prix.toFixed(3)} TND / unité</span>
                    <button type="button" className="text-button" onClick={() => cart.removeItem(item.plat_id)}>
                      Retirer
                    </button>
                  </div>
                  <div className="cart-quantity">
                    <button
                      type="button"
                      className="quantity-button"
                      onClick={() => cart.dec(item.plat_id)}
                      aria-label={`Diminuer la quantité de ${item.nom}`}
                    >
                      −
                    </button>
                    <span aria-live="polite">{item.quantite}</span>
                    <button
                      type="button"
                      className="quantity-button"
                      onClick={() => cart.inc(item.plat_id)}
                      aria-label={`Augmenter la quantité de ${item.nom}`}
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total-row">
              <span>Sous-total</span>
              <strong>{cart.subtotal.toFixed(3)} TND</strong>
            </div>
            <div className="cart-total-row cart-fee-row">
              <span>Livraison estimée</span>
              <span>{cart.fraisLivraison.toFixed(3)} TND</span>
            </div>
            <div className="cart-total-row cart-grand-total">
              <span>Total estimé</span>
              <strong>{cart.total.toFixed(3)} TND</strong>
            </div>
            {user ? (
              <Link to="/checkout" onClick={onClose} className="btn btn-primary cart-checkout">
                Continuer vers la livraison
                <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <Link to="/connexion" onClick={onClose} className="btn btn-primary cart-checkout">
                Connectez-vous pour commander
                <span aria-hidden="true">→</span>
              </Link>
            )}
            <button type="button" className="btn btn-ghost cart-continue" onClick={onClose}>
              Continuer mes achats
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
