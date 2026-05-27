import { useEffect, useState } from 'react';
import api from '../../api.js';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [sel, setSel] = useState(null);

  const loadList = () => api.get('/admin/users').then(({ data }) => setUsers(data));

  useEffect(() => {
    loadList();
  }, []);

  const open = async (id) => {
    const { data } = await api.get(`/admin/users/${id}`);
    setSel(data);
  };

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Clients & utilisateurs</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 400px)', gap: '1.25rem' }}>
        <div className="card" style={{ padding: 0, overflowX: 'auto', maxHeight: '70vh' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead style={{ background: '#1e2835', position: 'sticky', top: 0 }}>
              <tr>
                <th style={{ padding: '0.6rem', textAlign: 'left' }}>Nom</th>
                <th style={{ padding: '0.6rem', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '0.6rem' }}>Tél.</th>
                <th style={{ padding: '0.6rem' }}>Inscription</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: '1px solid #2a3544' }}>
                  <td style={{ padding: '0.6rem' }}>{u.nom}</td>
                  <td style={{ padding: '0.6rem' }}>{u.email}</td>
                  <td style={{ padding: '0.6rem' }}>{u.telephone}</td>
                  <td style={{ padding: '0.6rem' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '-'}</td>
                  <td style={{ padding: '0.6rem' }}>
                    <button type="button" className="btn btn-ghost" style={{ padding: '0.35rem 0.5rem' }} onClick={() => open(u.id)}>
                      Fiche
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: '1rem', alignSelf: 'start' }}>
          {!sel ? (
            <p className="muted">Sélectionnez un utilisateur.</p>
          ) : (
            <>
              <h3 style={{ marginTop: 0 }}>{sel.user.nom}</h3>
              <p className="muted">
                {sel.user.email} — {sel.user.telephone}
              </p>
              <p>Adresse : {sel.user.adresse || '—'}</p>
              <p>
                Total dépensé : <strong>{Number(sel.total_depense).toFixed(3)} TND</strong> —{' '}
                <strong>{sel.nombre_commandes}</strong> commande(s).
              </p>
              <h4>Historique</h4>
              <ul style={{ paddingLeft: '1rem', margin: 0, maxHeight: 240, overflow: 'auto' }}>
                {(sel.historique || []).map((h) => (
                  <li key={h.id}>
                    #{h.id} — {new Date(h.date).toLocaleString('fr-FR')} — {Number(h.total).toFixed(3)} TND —{' '}
                    <span className="muted">{h.statut_livraison}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
