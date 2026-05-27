/** Libellés affichés (valeurs API : Entrees, Plats, Desserts, Boissons) */
export const categorieLibelle = (c) =>
  ({
    Entrees: 'Entrées',
    Plats: 'Plats',
    Desserts: 'Desserts',
    Boissons: 'Boissons',
  }[c] || c);

export const CATEGORY_ORDER = ['Entrees', 'Plats', 'Desserts', 'Boissons'];
