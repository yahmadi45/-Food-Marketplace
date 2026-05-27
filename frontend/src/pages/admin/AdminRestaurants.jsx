import { useEffect, useState } from 'react';
import api from '../../api.js';

export default function AdminRestaurants() {
  const [rows, setRows] = useState([]);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    image: '',
    adresse: '',
    horaires: '',
    type_cuisine: '',
    note_moyenne: 4.5,
    temps_livraison_estime: 30,
    is_active: true,
  });

  const load = () =>
    api.get('/admin/restaurants').then(({ data }) => setRows(data));

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (edit) await api.put(`/admin/restaurants/${edit.id}`, { ...form, id: edit.id });
    else await api.post('/admin/restaurants', form);
    setEdit(null);
    setForm({
      nom: '',
      description: '',
      image: '',
      adresse: '',
      horaires: '',
      type_cuisine: '',
      note_moyenne: 4.5,
      temps_livraison_estime: 30,
      is_active: true,
    });
    load();
  };

  const startEdit = (r) => {
    setEdit(r);
    setForm({
      nom: r.nom,
      description: r.description || '',
      image: r.image || '',
      adresse: r.adresse || '',
      horaires: r.horaires || '',
      type_cuisine: r.type_cuisine || '',
      note_moyenne: r.note_moyenne,
      temps_livraison_estime: r.temps_livraison_estime,
      is_active: !!r.is_active,
    });
  };

  const del = async (id) => {
    if (!window.confirm('Supprimer ce restaurant et ses plats ?')) return;
    await api.delete(`/admin/restaurants/${id}`);
    load();
  };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Restaurants</h1>
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h3>{edit ? 'Modifier' : 'Ajouter'} un restaurant</h3>
        <form onSubmit={save} style={{ display: 'grid', gap: '0.65rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))' }}>
          <label>
            Nom
            <input required style={{ width: '100%', marginTop: 4 }} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
          </label>
          <label>
            Type cuisine
            <input required style={{ width: '100%', marginTop: 4 }} value={form.type_cuisine} onChange={(e) => setForm({ ...form, type_cuisine: e.target.value })} />
          </label>
          <label>
            Image URL
            <input style={{ width: '100%', marginTop: 4 }} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
          </label>
          <label>
            Note (0–5)
            <input type="number" step="0.1" style={{ width: '100%', marginTop: 4 }} value={form.note_moyenne} onChange={(e) => setForm({ ...form, note_moyenne: e.target.value })} />
          </label>
          <label>
            Délai (min)
            <input type="number" style={{ width: '100%', marginTop: 4 }} value={form.temps_livraison_estime} onChange={(e) => setForm({ ...form, temps_livraison_estime: e.target.value })} />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Adresse
            <textarea required rows={2} style={{ width: '100%', marginTop: 4 }} value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            Description
            <textarea rows={2} style={{ width: '100%', marginTop: 4 }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </label>
          <label>
            Horaires
            <input style={{ width: '100%', marginTop: 4 }} value={form.horaires} onChange={(e) => setForm({ ...form, horaires: e.target.value })} />
          </label>
          <label className="row" style={{ alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Actif
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
              <th style={{ padding: '0.6rem', textAlign: 'left' }}>Nom</th>
              <th style={{ padding: '0.6rem' }}>Cuisine</th>
              <th style={{ padding: '0.6rem' }}>Note</th>
              <th style={{ padding: '0.6rem' }}>Liv.</th>
              <th style={{ padding: '0.6rem' }}>Actif</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid #2a3544' }}>
                <td style={{ padding: '0.6rem' }}>{r.nom}</td>
                <td style={{ padding: '0.6rem' }}>{r.type_cuisine}</td>
                <td style={{ padding: '0.6rem' }}>{Number(r.note_moyenne).toFixed(1)}</td>
                <td style={{ padding: '0.6rem' }}>{r.temps_livraison_estime} min</td>
                <td style={{ padding: '0.6rem' }}>{r.is_active ? 'oui' : 'non'}</td>
                <td style={{ padding: '0.6rem', whiteSpace: 'nowrap' }}>
                  <button type="button" className="btn btn-ghost" style={{ padding: '0.35rem 0.6rem' }} onClick={() => startEdit(r)}>
                    Modifier
                  </button>
                  <button type="button" className="btn btn-danger" style={{ padding: '0.35rem 0.6rem' }} onClick={() => del(r.id)}>
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
