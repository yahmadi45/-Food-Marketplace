import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);
const DELIVERY = 5.5;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  const addItem = (plat, rId) => {
    if (restaurantId !== null && restaurantId !== rId) {
      const ok = window.confirm('Votre panier contient des plats d’un autre restaurant. Vider le panier et continuer ?');
      if (!ok) return false;
      setItems([]);
    }
    setRestaurantId(rId);
    setItems((previous) => {
      const existingIndex = previous.findIndex((item) => item.plat_id === plat.id);
      if (existingIndex >= 0) {
        const next = [...previous];
        next[existingIndex] = { ...next[existingIndex], quantite: next[existingIndex].quantite + 1 };
        return next;
      }
      return [...previous, {
        plat_id: plat.id,
        nom: plat.nom,
        prix: Number(plat.prix),
        image: plat.image,
        quantite: 1,
      }];
    });
    return true;
  };

  const removeItem = (plat_id) => {
    setItems((previous) => {
      const next = previous.filter((item) => item.plat_id !== plat_id);
      if (next.length === 0) setRestaurantId(null);
      return next;
    });
  };

  const setQty = (plat_id, quantity) => {
    if (quantity < 1) {
      removeItem(plat_id);
      return;
    }
    setItems((previous) => previous.map((item) => item.plat_id === plat_id ? { ...item, quantite: quantity } : item));
  };

  const inc = (plat_id) =>
    setItems((previous) => previous.map((item) => item.plat_id === plat_id ? { ...item, quantite: item.quantite + 1 } : item));

  const dec = (plat_id) => {
    setItems((previous) => {
      const next = previous.flatMap((item) =>
        item.plat_id !== plat_id ? [item] : item.quantite <= 1 ? [] : [{ ...item, quantite: item.quantite - 1 }],
      );
      if (next.length === 0) setRestaurantId(null);
      return next;
    });
  };

  const clear = () => {
    setItems([]);
    setRestaurantId(null);
  };

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.prix * item.quantite, 0), [items]);
  const total = useMemo(() => Math.round((subtotal + (items.length ? DELIVERY : 0)) * 1000) / 1000, [items.length, subtotal]);
  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantite, 0), [items]);
  const value = useMemo(() => ({ items, restaurantId, addItem, setQty, inc, dec, removeItem, clear, subtotal, total, fraisLivraison: DELIVERY, count }), [items, restaurantId, subtotal, total, count]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart hors provider');
  return context;
}
