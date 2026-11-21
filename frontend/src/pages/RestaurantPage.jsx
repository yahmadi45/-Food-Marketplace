import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { CATEGORY_ORDER, categorieLibelle } from '../util/categories.js';

export default function RestaurantPage() {
  const { id } = useParams();
  const cart = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setRestaurant(null);
    Promise.all([
      api.get(`/restaurants/${id}`, { signal: controller.signal }),
      api.get(`/restaurants/${id}/plats`, { signal: controller.signal }),
      api.get(`/restaurants/${id}/avis`, { signal: controller.signal }),
    ])
      .then(([restaurantResponse, dishResponse, reviewResponse]) => {
        setRestaurant(restaurantResponse.data);
        setDishes(dishResponse.data);
        setReviews(reviewResponse.data);
        setError('');
      })
      .catch((requestError) => {
        if (requestError.code !== 'ERR_CANCELED') setError('Restaurant introuvable ou temporairement indisponible.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  const dishesByCategory = useMemo(() => dishes.reduce((groups, dish) => {
    const category = dish.categorie || 'Autres';
    (groups[category] ||= []).push(dish);
    return groups;
  }, {}), [dishes]);

  const categories = useMemo(() => Object.keys(dishesByCategory).sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);
    if (indexA >= 0 && indexB >= 0) return indexA - indexB;
    if (indexA >= 0) return -1;
    if (indexB >= 0) return 1;
    return a.localeCompare(b);
  }), [dishesByCategory]);

  if (loading) return <div className="container" role="status" style={{ padding: '5rem 0', textAlign: 'center' }}>Chargement du restaurant…</div>;
  if (error || !restaurant) {
    return <div className="container empty-state" style={{ minHeight: '55vh' }}><span className="empty-state-icon" aria-hidden="true">!</span><h1>Restaurant indisponible</h1><p>{error}</p><Link className="btn btn-primary" to="/">Retour aux restaurants</Link></div>;
  }

  return (
    <div className="restaurant-page">
      <section className="restaurant-hero">
        {restaurant.image ? <img src={restaurant.image} alt={restaurant.nom} /> : <div className="restaurant-image-placeholder">🍽️</div>}
        <div className="restaurant-hero-shade" />
        <div className="container restaurant-hero-content">
          <Link to="/" className="back-link">← Tous les restaurants</Link>
          <span className="eyebrow">{restaurant.type_cuisine}</span>
          <h1>{restaurant.nom}</h1>
          <p>{restaurant.description}</p>
          <div className="restaurant-hero-meta"><span>★ {Number(restaurant.note_moyenne).toFixed(1)}</span><span>◷ {restaurant.temps_livraison_estime} min</span><span>⌖ {restaurant.adresse}</span></div>
        </div>
      </section>

      <div className="container menu-layout">
        <main className="menu-main">
          <div className="section-heading"><div><span className="eyebrow">Préparé avec soin</span><h2>Le menu</h2></div><span className="catalog-count">{dishes.length} plats</span></div>
          {categories.length === 0 ? <div className="card empty-state"><h3>Menu en préparation</h3><p>Les plats de ce restaurant seront bientôt disponibles.</p></div> : categories.map((category) => (
            <section key={category} className="menu-category">
              <div className="menu-category-heading"><h3>{categorieLibelle(category)}</h3><span>{dishesByCategory[category].length} choix</span></div>
              <div className="dish-grid">
                {dishesByCategory[category].map((dish) => (
                  <article key={dish.id} className="card dish-card">
                    <div className="dish-photo">{dish.image ? <img src={dish.image} alt={dish.nom} loading="lazy" /> : <div className="restaurant-image-placeholder">🍴</div>}</div>
                    <div className="dish-content"><div><h4>{dish.nom}</h4><p>{dish.description || 'Une spécialité à découvrir.'}</p></div><div className="dish-footer"><strong>{Number(dish.prix).toFixed(3)} <small>TND</small></strong><button type="button" className="btn btn-primary add-dish" onClick={() => cart.addItem(dish, Number(id))} aria-label={`Ajouter ${dish.nom} au panier`}>+ Ajouter</button></div></div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </main>
        <aside className="card restaurant-aside"><span className="eyebrow">Bon à savoir</span><h3>Votre pause gourmande</h3><p>Choisissez vos plats et ajoutez-les au panier. La livraison est estimée à environ {restaurant.temps_livraison_estime} minutes.</p><div className="aside-detail"><span>Horaires</span><strong>{restaurant.horaires || 'Consulter le restaurant'}</strong></div><div className="aside-detail"><span>Adresse</span><strong>{restaurant.adresse}</strong></div></aside>
      </div>

      {reviews.length > 0 && <section className="container reviews-section"><div className="section-heading"><div><span className="eyebrow">Ils en parlent</span><h2>Avis clients</h2></div></div><div className="reviews-grid">{reviews.map((review, index) => <article key={`${review.user_nom}-${review.created_at}-${index}`} className="card review-card"><div className="review-top"><strong>{review.user_nom}</strong><span>{'★'.repeat(review.note)}{'☆'.repeat(5 - review.note)}</span></div><p>{review.commentaire}</p><small>{new Date(review.created_at).toLocaleDateString('fr-FR')}</small></article>)}</div></section>}
    </div>
  );
}
