import { useEffect, useState } from 'react';
import api from '../../api.js';

const STATUTS = [
  ['en_attente', 'En attente'],
  ['confirmee', 'Confirmée'],
  ['en_preparation', 'En préparation'],
  ['en_livraison', 'En livraison'],
  ['livree', 'Livrée'],
  ['annulee', 'Annulée'],
];

export default function AdminCommandes() {
  const [rows, setRows] = useState([]);
  const [detail, setDetail] = useState(null);
  const [filters, setFilters] = useState({ statut: '', restaurant_id: '', du: '', au: '' });
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    api.get('/admin/restaurants').then(({ data }) => setRestaurants(data));
  }, []);

  const load = () => {
    const p = new URLSearchParams();
    if (filters.statut) p.set('statut', filters.statut);
    if (filters.restaurant_id) p.set('restaurant_id', filters.restaurant_id);
    if (filters.du) p.set('du', filters.du);
    if (filters.au) p.set('au', filters.au);
    api.get(`/admin/commandes?${p}`).then(({ data }) => setRows(data));
  };

  useEffect(() => {
    load();
  }, []);

  const fetchDetail = async (id) => {
    const { data } = await api.get(`/admin/commandes/${id}`);
    setDetail(data);
  };

  const patchStatut = async (id, statut_livraison) => {
    await api.patch(`/admin/commandes/${id}/statut`, { statut_livraison });
    load();
    if (detail?.commande?.id === id) fetchDetail(id);
  };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Commandes</h1>

      <div className="card row" style={{ padding: '1rem', gap: '0.65rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <select value={filters.statut} onChange={(e) => setFilters({ ...filters, statut: e.target.value })}>
          <option value="">Tous statuts</option>
          {STATUTS.map(([v, L]) => (
            <option key={v} value={v}>
              {L}
            </option>
          ))}
        </select>
        <select value={filters.restaurant_id} onChange={(e) => setFilters({ ...filters, restaurant_id: e.target.value })}>
          <option value="">Tous restaurants</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nom}
            </option>
          ))}
        </select>
        <label className="row" style={{ gap: 8 }}>
          Du{' '}
          <input type="date" value={filters.du} onChange={(e) => setFilters({ ...filters, du: e.target.value })} />
        </label>
        <label className="row" style={{ gap: 8 }}>
          Au{' '}
          <input type="date" value={filters.au} onChange={(e) => setFilters({ ...filters, au: e.target.value })} />
        </label>
        <button type="button" className="btn btn-primary" onClick={load}>
          Filtrer
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
          <thead style={{ background: '#1e2835' }}>
            <tr>
              <th style={{ padding: '0.55rem', textAlign: 'left' }}>#</th>
              <th style={{ padding: '0.55rem', textAlign: 'left' }}>Client</th>
              <th style={{ padding: '0.55rem', textAlign: 'left' }}>Restaurant</th>
              <th style={{ padding: '0.55rem' }}>Date</th>
              <th style={{ padding: '0.55rem' }}>Total</th>
              <th style={{ padding: '0.55rem' }}>Statut</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} style={{ borderTop: '1px solid #2a3544' }}>
                <td style={{ padding: '0.55rem' }}>{c.id}</td>
                <td style={{ padding: '0.55rem' }}>{c.client_nom}</td>
                <td style={{ padding: '0.55rem' }}>{c.restaurant_nom}</td>
                <td style={{ padding: '0.55rem' }}>{new Date(c.date).toLocaleString('fr-FR')}</td>
                <td style={{ padding: '0.55rem' }}>{Number(c.total).toFixed(3)}</td>
                <td style={{ padding: '0.55rem' }}>
                  <select value={c.statut_livraison} onChange={(e) => patchStatut(c.id, e.target.value)} style={{ maxWidth: 160 }}>
                    {STATUTS.map(([v, L]) => (
                      <option key={v} value={v}>
                        {L}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '0.55rem' }}>
                  <button type="button" className="btn btn-ghost" style={{ padding: '0.3rem 0.5rem' }} onClick={() => fetchDetail(c.id)}>
                    Détail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detail && (
        <div role="dialog" style={{ marginTop: '1.25rem' }} className="card">
          <div style={{ padding: '1rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Commande #{detail.commande.id}</strong>
            <button type="button" className="btn btn-ghost" onClick={() => setDetail(null)}>
              ✕
            </button>
          </div>
          <div style={{ padding: '1rem' }}>
            <p className="muted">
              Client : {detail.commande.client_nom} ({detail.commande.client_email}) — {detail.commande.client_telephone}
            </p>
            <p>
              Livraison : {detail.commande.adresse_livraison}
              {detail.commande.commentaire ? ` — « ${detail.commande.commentaire} »` : ''}
            </p>
            <ul>
              {detail.items.map((i) => (
                <li key={i.id}>
                  {i.plat_nom} × {i.quantite} — {Number(i.sous_total).toFixed(3)} TND
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
