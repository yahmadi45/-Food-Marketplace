import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';

export default function HomePage() {
  const [list, setList] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [q, setQ] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [noteMin, setNoteMin] = useState('');
  const [tempsMax, setTempsMax] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get('/restaurants/cuisine-types')
      .then(({ data }) => { if (active) setCuisines(data); })
      .catch(() => { if (active) setCuisines([]); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (cuisine) params.set('cuisine', cuisine);
      if (noteMin) params.set('noteMin', noteMin);
      if (tempsMax) params.set('tempsMax', tempsMax);

      api
        .get(`/restaurants?${params}`, { signal: controller.signal })
        .then(({ data }) => {
          setList(data);
          setErr('');
        })
        .catch((error) => {
          if (error.code !== 'ERR_CANCELED') setErr('Impossible de charger les restaurants. Vérifiez que l’API fonctionne.');
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q, cuisine, noteMin, tempsMax]);

  const subtitle = useMemo(
    () => `${list.length} restaurant${list.length > 1 ? 's' : ''} disponible${list.length > 1 ? 's' : ''}`,
    [list.length],
  );

  const clearFilters = () => {
    setQ('');
    setCuisine('');
    setNoteMin('');
    setTempsMax('');
  };

  return (
    <div className="container home-page">
      <section className="hero">
        <span className="eyebrow"><span className="eyebrow-dot" /> Livraison locale, saveurs d’ici</span>
        <h1>Les bonnes tables,<br /><span>près de chez vous.</span></h1>
        <p>Explorez les restaurants du quartier, choisissez vos plats préférés et faites-vous plaisir.</p>
        <a className="btn btn-primary hero-cta" href="#restaurants">Explorer les restaurants <span aria-hidden="true">↓</span></a>
        <div className="hero-note"><span aria-hidden="true">✦</span> Des restaurants sélectionnés à Tunis et ses environs</div>
      </section>

      <section id="restaurants" className="catalog-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">À la carte</span>
            <h2>Nos restaurants</h2>
          </div>
          <span className="catalog-count" aria-live="polite">{loading ? 'Chargement…' : subtitle}</span>
        </div>

        <div className="card filter-panel">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input aria-label="Rechercher un restaurant" placeholder="Un restaurant, une envie…" value={q} onChange={(event) => setQ(event.target.value)} />
          </label>
          <label className="filter-field">
            <span>CUISINE</span>
            <select aria-label="Type de cuisine" value={cuisine} onChange={(event) => setCuisine(event.target.value)}>
              <option value="">Toutes les cuisines</option>
              {cuisines.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="filter-field compact-filter">
            <span>NOTE MIN.</span>
            <select aria-label="Note minimum" value={noteMin} onChange={(event) => setNoteMin(event.target.value)}>
              <option value="">Toutes les notes</option>
              <option value="4">4+ étoiles</option>
              <option value="4.5">4,5+ étoiles</option>
            </select>
          </label>
          <label className="filter-field compact-filter">
            <span>LIVRAISON</span>
            <select aria-label="Délai maximum de livraison" value={tempsMax} onChange={(event) => setTempsMax(event.target.value)}>
              <option value="">Tous les délais</option>
              <option value="30">30 min max</option>
              <option value="45">45 min max</option>
            </select>
          </label>
        </div>

        {err && <div className="notice notice-error" role="alert">{err}</div>}

        {loading && list.length === 0 ? (
          <div className="restaurant-grid" aria-label="Chargement des restaurants">
            {[1, 2, 3].map((item) => <div key={item} className="card restaurant-skeleton" />)}
          </div>
        ) : (
          <div className="restaurant-grid">
            {list.map((restaurant) => (
              <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`} className="restaurant-link">
                <article className="card restaurant-card">
                  <div className="restaurant-image-wrap">
                    {restaurant.image ? (
                      <img className="restaurant-image" src={restaurant.image} alt={restaurant.nom} loading="lazy" />
                    ) : (
                      <div className="restaurant-image-placeholder" aria-hidden="true">🍽️</div>
                    )}
                    <span className="restaurant-cuisine">{restaurant.type_cuisine}</span>
                    <span className="restaurant-rating">★ {Number(restaurant.note_moyenne).toFixed(1)}</span>
                  </div>
                  <div className="restaurant-info">
                    <div className="restaurant-title-row">
                      <h3>{restaurant.nom}</h3>
                      <span className="restaurant-arrow" aria-hidden="true">↗</span>
                    </div>
                    <p>{restaurant.description || 'Découvrez les spécialités de cette adresse.'}</p>
                    <div className="restaurant-meta"><span>⌖ {restaurant.adresse}</span><span>◷ {restaurant.temps_livraison_estime} min</span></div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {!loading && !err && list.length === 0 && (
          <div className="card empty-state">
            <span className="empty-state-icon" aria-hidden="true">⌕</span>
            <h3>Aucun restaurant trouvé</h3>
            <p>Changez les filtres ou essayez une autre recherche.</p>
            <button type="button" className="btn btn-ghost" onClick={clearFilters}>Effacer les filtres</button>
          </div>
        )}
      </section>

      <footer className="site-footer"><span>FOOD MARKETPLACE</span><span>Fait avec soin · Tunis, Tunisie</span></footer>
    </div>
  );
}
