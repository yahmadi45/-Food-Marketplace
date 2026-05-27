import { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

const DELIVERY = 5.5;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  const addItem = (plat, rId) => {
    if (restaurantId !== null && restaurantId !== rId) {
      const ok = window.confirm(
        'Votre panier contient des plats d’un autre restaurant. Vider le panier et continuer ?'
      );
      if (!ok) return false;
      setItems([]);
    }
    setRestaurantId(rId);
    setItems((prev) => {
      const i = prev.findIndex((x) => x.plat_id === plat.id);
      if (i >= 0) {
        const n = [...prev];
        n[i] = { ...n[i], quantite: n[i].quantite + 1 };
        return n;
      }
      return [
        ...prev,
        {
          plat_id: plat.id,
          nom: plat.nom,
          prix: Number(plat.prix),
          image: plat.image,
          quantite: 1,
        },
      ];
    });
    return true;
  };

  const setQty = (plat_id, qty) => {
    if (qty < 1) {
      removeItem(plat_id);
      return;
    }
    setItems((prev) => prev.map((x) => (x.plat_id === plat_id ? { ...x, quantite: qty } : x)));
  };

  const inc = (plat_id) =>
    setItems((prev) =>
      prev.map((x) => (x.plat_id === plat_id ? { ...x, quantite: x.quantite + 1 } : x))
    );
  const dec = (plat_id) =>
    setItems((prev) => {
      return prev.flatMap((x) =>
        x.plat_id !== plat_id
          ? [x]
          : x.quantite <= 1
            ? []
            : [{ ...x, quantite: x.quantite - 1 }]
      );
    });

  const removeItem = (plat_id) =>
    setItems((prev) => {
      const n = prev.filter((x) => x.plat_id !== plat_id);
      if (n.length === 0) setRestaurantId(null);
      return n;
    });

  const clear = () => {
    setItems([]);
    setRestaurantId(null);
  };

  const subtotal = useMemo(() => items.reduce((s, x) => s + x.prix * x.quantite, 0), [items]);
  const total = useMemo(() => Math.round((subtotal + DELIVERY) * 1000) / 1000, [subtotal]);

  const value = useMemo(
    () => ({
      items,
      restaurantId,
      addItem,
      setQty,
      inc,
      dec,
      removeItem,
      clear,
      subtotal,
      total,
      fraisLivraison: DELIVERY,
      count: items.reduce((n, x) => n + x.quantite, 0),
    }),
    [items, restaurantId, subtotal, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart hors provider');
  return ctx;
}
