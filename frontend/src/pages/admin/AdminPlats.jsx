import { useEffect, useState } from 'react';
import api from '../../api.js';
import { categorieLibelle } from '../../util/categories.js';

const CAT = ['Entrees', 'Plats', 'Desserts', 'Boissons'];

export default function AdminPlats() {
  const [restaurants, setRestaurants] = useState([]);
  const [rows, setRows] = useState([]);
  const [filterResto, setFilterResto] = useState('');
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({
    restaurant_id: '',
    nom: '',
    description: '',
    prix: '',
    image: '',
    categorie: 'Entrees',
    is_available: true,
  });

  useEffect(() => {
    api.get('/admin/restaurants').then(({ data }) => {
      setRestaurants(data);
      if (data.length && !form.restaurant_id) setForm((f) => ({ ...f, restaurant_id: data[0].id }));
    });
  }, []);

  const load = () => {
    const q = filterResto ? `?restaurant_id=${filterResto}` : '';
    api.get(`/admin/plats${q}`).then(({ data }) => setRows(data));
  };

  useEffect(() => {
    load();
  }, [filterResto]);

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form, restaurant_id: Number(form.restaurant_id), prix: Number(form.prix) };
    if (edit) await api.put(`/admin/plats/${edit.id}`, payload);
    else await api.post('/admin/plats', payload);
    setEdit(null);
    setForm((f) => ({
      restaurant_id: f.restaurant_id,
      nom: '',
      description: '',
      prix: '',
      image: '',
      categorie: 'Entrees',
      is_available: true,
    }));
    load();
  };

  const startEdit = (p) => {
    setEdit(p);
    setForm({
      restaurant_id: p.restaurant_id,
      nom: p.nom,
      description: p.description || '',
      prix: p.prix,
      image: p.image || '',
      categorie: p.categorie,
      is_available: !!p.is_available,
    });
  };

  const del = async (id) => {
    if (!window.confirm('Supprimer ce plat ?')) return;
    await api.delete(`/admin/plats/${id}`);
    load();
  };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Plats</h1>

      <div className="row" style={{ marginBottom: '1rem' }}>
        <label>
          Restaurant{' '}
          <select value={filterResto} onChange={(e) => setFilterResto(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="">Tous</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nom}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h3>{edit ? 'Modifier' : 'Créer'} un plat</h3>
        <form onSubmit={save} style={{ display: 'grid', gap: '0.65rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))' }}>
          <label>
            Restaurant
            <select required style={{ width: '100%', marginTop: 4 }} value={form.restaurant_id} onChange={(e) => setForm({ ...form, restaurant_id: e.target.value })}>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nom}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nom
            <input required style={{ width: '100%', marginTop: 4 }} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          </label>
          <label>
            Prix (TND)
            <input required type="number" step="0.001" style={{ width: '100%', marginTop: 4 }} value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} />
          </label>
          <label>
            Catégorie
            <select style={{ width: '100%', marginTop: 4 }} value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}>
              {CAT.map((c) => (
                <option key={c} value={c}>
                  {categorieLibelle(c)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Photo URL
            <input style={{ width: '100%', marginTop: 4 }} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </label>
          <label className="row" style={{ alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.is_available} onChange={(e) => setForm({ ...form, is_available: e.target.checked })} /> Disponible
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Description
            <textarea rows={2} style={{ width: '100%', marginTop: 4 }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <div className="row" style={{ gap: 8 }}>
            <button type="submit" className="btn btn-primary">
              Enregistrer
            </button>
            {edit && (
              <button type="button" className="btn btn-ghost" onClick={() => setEdit(null)}>
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead style={{ background: '#1e2835' }}>
            <tr>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Plat</th>
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Restaurant</th>
              <th style={{ padding: '0.6rem' }}>Cat.</th>
              <th style={{ padding: '0.6rem' }}>Prix</th>
              <th style={{ padding: '0.6rem' }}>OK</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} style={{ borderTop: '1px solid #2a3544' }}>
                <td style={{ padding: '0.6rem' }}>{p.nom}</td>
                <td style={{ padding: '0.6rem' }}>{p.restaurant_nom}</td>
                <td style={{ padding: '0.6rem' }}>{categorieLibelle(p.categorie)}</td>
                <td style={{ padding: '0.6rem' }}>{Number(p.prix).toFixed(3)}</td>
                <td style={{ padding: '0.6rem' }}>{p.is_available ? 'oui' : 'non'}</td>
                <td style={{ padding: '0.6rem' }}>
                  <button type="button" className="btn btn-ghost" style={{ padding: '0.35rem 0.6rem' }} onClick={() => startEdit(p)}>
                    Modifier
                  </button>
                  <button type="button" className="btn btn-danger" style={{ padding: '0.35rem 0.6rem' }} onClick={() => del(p.id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
