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

  useEffect(() => {
    api
      .get('/restaurants/cuisine-types')
      .then(({ data }) => setCuisines(data))
      .catch(() => setCuisines([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (cuisine) params.set('cuisine', cuisine);
      if (noteMin) params.set('noteMin', noteMin);
      if (tempsMax) params.set('tempsMax', tempsMax);
      api
        .get(`/restaurants?${params}`)
        .then(({ data }) => {
          setList(data);
          setErr('');
        })
        .catch(() => setErr('Impossible de charger les restaurants.'));
    }, 250);
    return () => clearTimeout(t);
  }, [q, cuisine, noteMin, tempsMax]);

  const subtitle = useMemo(
    () => `${list.length} restaurant${list.length > 1 ? 's' : ''} disponible${list.length > 1 ? 's' : ''}`,
    [list.length]
  );

  return (
    <div className="container">
      <section style={{ padding: '2.5rem 0 1rem', textAlign: 'center', maxWidth: 720, marginInline: 'auto' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 2.75rem)', marginBottom: '0.5rem' }}>
          Commandez les meilleurs repas près de chez vous
        </h1>
        <p className="muted">Parcourez les restaurants, filtres et note moyenne — livraison rapide.</p>
      </section>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'grid', gap: '1rem' }}>
        {err && <p style={{ color: 'var(--danger)', margin: 0 }}>{err}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <input placeholder="Rechercher un restaurant…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
            <option value="">Type de cuisine (tous)</option>
            {cuisines.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            placeholder="Note min."
            value={noteMin}
            onChange={(e) => setNoteMin(e.target.value)}
          />
          <input type="number" min="5" placeholder="Délai max (minutes)" value={tempsMax} onChange={(e) => setTempsMax(e.target.value)} />
        </div>
        <span className="muted">{subtitle}</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {list.map((r) => (
          <Link key={r.id} to={`/restaurant/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <article className="card" style={{ height: '100%', transition: 'transform 0.15s' }}>
              <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                {r.image ? (
                  <img src={r.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#334155' }} />
                )}
              </div>
              <div style={{ padding: '1rem 1.1rem' }}>
                <h2 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem' }}>{r.nom}</h2>
                <div className="row" style={{ marginBottom: '0.35rem' }}>
                  <span className="tag">{r.type_cuisine}</span>
                  <span className="muted">★ {Number(r.note_moyenne).toFixed(1)}</span>
                  <span className="muted">{r.temps_livraison_estime} min</span>
                </div>
                <p className="muted" style={{ margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {r.description}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {!err && list.length === 0 && <p style={{ textAlign: 'center' }} className="muted">Aucun résultat.</p>}
    </div>
  );
}
