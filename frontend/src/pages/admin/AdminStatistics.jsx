import { useEffect, useState } from 'react';
import api from '../../api.js';

export default function AdminStatistics() {
  const [d, setD] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setD(data));
  }, []);

  if (!d) return <p className="muted">Chargement…</p>;

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Statistiques détaillées</h1>
      <p className="muted">Complément au dashboard : tableaux synthétiques (DS — onglet Statistiques).</p>

      <div className="card" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
        <h3 style={{ marginTop: 0 }}>Répartition CA par restaurant</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.55rem', textAlign: 'left' }}>Restaurant</th>
              <th style={{ padding: '0.55rem', textAlign: 'right' }}>CA cumulé (TND)</th>
            </tr>
          </thead>
          <tbody>
            {(d.ventes_par_restaurant || []).map((r) => (
              <tr key={r.nom}>
                <td style={{ padding: '0.55rem' }}>{r.nom}</td>
                <td style={{ padding: '0.55rem', textAlign: 'right' }}>{Number(r.ca).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Série CA journalière (brute)</h3>
        <div style={{ maxHeight: 320, overflow: 'auto', fontFamily: 'monospace', fontSize: '0.8rem' }}>
          {(d.caParJour || []).map((row) => (
            <div key={row.jour}>
              {row.jour}: {Number(row.ca).toFixed(3)}
            </div>
          ))}
          {(!d.caParJour || d.caParJour.length === 0) && <span className="muted">Pas encore assez de données.</span>}
        </div>
      </div>
    </div>
  );
}
