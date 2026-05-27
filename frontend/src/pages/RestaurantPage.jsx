import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { CATEGORY_ORDER, categorieLibelle } from '../util/categories.js';

export default function RestaurantPage() {
  const { id } = useParams();
  const cart = useCart();
  const [r, setR] = useState(null);
  const [plats, setPlats] = useState([]);
  const [avis, setAvis] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/restaurants/${id}`),
      api.get(`/restaurants/${id}/plats`),
      api.get(`/restaurants/${id}/avis`),
    ])
      .then(([a, b, c]) => {
        setR(a.data);
        setPlats(b.data);
        setAvis(c.data);
        setErr('');
      })
      .catch(() => setErr('Restaurant introuvable'));
  }, [id]);

  const byCat = useMemo(() => {
    const m = {};
    for (const p of plats) {
      const k = p.categorie || 'Autres';
      if (!m[k]) m[k] = [];
      m[k].push(p);
    }
    return m;
  }, [plats]);

  const cats = useMemo(() => {
    const keys = Object.keys(byCat);
    keys.sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a);
      const ib = CATEGORY_ORDER.indexOf(b);
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return a.localeCompare(b);
    });
    return keys;
  }, [byCat]);

  if (err || !r) {
    return (
      <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
        <p>{err || 'Chargement…'}</p>
        <Link to="/">← Accueil</Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ position: 'relative', minHeight: 220 }}>
        {r.image ? (
          <img src={r.image} alt="" style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ height: 280, background: '#334155' }} />
        )}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1.5rem',
            background: 'linear-gradient(transparent, rgba(15,20,25,0.95))',
          }}
        >
          <div className="container">
            <Link to="/" className="muted" style={{ textDecoration: 'none' }}>
              ← Retour
            </Link>
            <h1 style={{ margin: '0.5rem 0 0.25rem' }}>{r.nom}</h1>
            <div className="row">
              <span className="tag">{r.type_cuisine}</span>
              <span>★ {Number(r.note_moyenne).toFixed(1)}</span>
              <span className="muted">Livraison ~ {r.temps_livraison_estime} min</span>
            </div>
            <p style={{ margin: '0.5rem 0 0' }} className="muted">
              📍 {r.adresse}
            </p>
            <p style={{ margin: '0.25rem 0 0' }} className="muted">
              🕐 {r.horaires}
            </p>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem' }}>
        {cats.map((cat) => (
          <section key={cat} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.35rem' }}>{categorieLibelle(cat)}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {byCat[cat].map((p) => (
                <div key={p.id} className="card" style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto' }}>
                  {p.image ? (
                    <img src={p.image} alt="" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ aspectRatio: '4/3', background: '#2a3544' }} />
                  )}
                  <div style={{ padding: '0.85rem 1rem' }}>
                    <h3 style={{ margin: '0 0 0.35rem', fontSize: '1rem' }}>{p.nom}</h3>
                    <p className="muted" style={{ margin: '0', fontSize: '0.9rem' }}>
                      {p.description}
                    </p>
                  </div>
                  <div className="row" style={{ justifyContent: 'space-between', padding: '0 1rem 1rem' }}>
                    <strong>{Number(p.prix).toFixed(3)} TND</strong>
                    <button type="button" className="btn btn-primary" onClick={() => cart.addItem(p, Number(id))}>
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {avis.length > 0 && (
        <div className="container" style={{ padding: '2rem 0' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Avis clients</h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {avis.map((a, i) => (
              <div key={i} className="card" style={{ padding: '1rem' }}>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{a.user_nom}</strong>
                  <div>{'★'.repeat(a.note)}{'☆'.repeat(5 - a.note)}</div>
                </div>
                <p style={{ margin: '0' }}>{a.commentaire}</p>
                <small className="muted" style={{ marginTop: '0.5rem', display: 'block' }}>
                  {new Date(a.created_at).toLocaleDateString('fr-FR')}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
