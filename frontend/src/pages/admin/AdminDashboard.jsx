import { useEffect, useState } from 'react';
import api from '../../api.js';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#f4a742', '#2dd4bf', '#818cf8', '#f472b6', '#34d399', '#fca5a5'];

export default function AdminDashboard() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then(({ data }) => setD(data))
      .catch(() => setErr('Accès admin refusé ou API indisponible'));
  }, []);

  if (err)
    return (
      <p style={{ color: 'var(--danger)' }}>
        {err} — vérifiez que vous êtes connecté comme admin (<code>admin@marketplace.local</code>).
      </p>
    );
  if (!d)
    return <p className="muted">Chargement du tableau de bord…</p>;

  const kpi = d.kpi;
  const kpis = [
    { label: 'Ventes du jour', val: `${Number(kpi.ventes_jour).toFixed(3)} TND` },
    { label: 'Ventes du mois', val: `${Number(kpi.ventes_mois).toFixed(3)} TND` },
    { label: 'Ventes année', val: `${Number(kpi.ventes_an).toFixed(3)} TND` },
    { label: 'Commandes (hors annulées)', val: kpi.nombre_commandes },
    { label: 'Clients', val: kpi.nombre_clients },
    { label: 'Restaurants actifs', val: kpi.restaurants_actifs },
  ];

  const pieData = (d.ventes_par_restaurant || []).slice(0, 6).map((r) => ({ name: r.nom, value: Number(r.ca) }));

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.75rem',
        }}
      >
        {kpis.map((k) => (
          <div key={k.label} className="card" style={{ padding: '1rem' }}>
            <div className="muted" style={{ fontSize: '0.8rem' }}>
              {k.label}
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.35rem' }}>{k.val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="card" style={{ padding: '1rem', minHeight: 300 }}>
          <h3 style={{ marginTop: 0 }}>Évolution CA (14 j)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={d.caParJour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="jour" tick={{ fill: '#8b9bb0', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8b9bb0', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a222c', border: '1px solid #334155' }} />
              <Legend />
              <Line type="monotone" dataKey="ca" name="CA (TND)" stroke="#f4a742" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: '1rem', minHeight: 300 }}>
          <h3 style={{ marginTop: 0 }}>Commandes par jour</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={d.histogramme_commandes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="jour" tick={{ fill: '#8b9bb0', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8b9bb0', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a222c', border: '1px solid #334155' }} />
              <Legend />
              <Bar dataKey="nb" name="Nombre" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ marginTop: 0 }}>Répartition CA par restaurant</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((_, i) => (
                  <Cell key={String(i)} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a222c', border: '1px solid #334155' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <h3 style={{ marginTop: 0 }}>Top 5 plats / Flop 5</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <strong style={{ color: '#2dd4bf' }}>Top 5 vendus</strong>
              <ol style={{ margin: '0.5rem 0 0', paddingLeft: '1rem' }}>
                {(d.top_plats || []).map((x) => (
                  <li key={x.nom}>{x.nom} — {x.vendus} ventes</li>
                ))}
              </ol>
            </div>
            <div>
              <strong style={{ color: '#fca5a5' }}>Flops (faible rotation)</strong>
              <ol style={{ margin: '0.5rem 0 0', paddingLeft: '1rem' }}>
                {(d.flop_plats || []).map((x) => (
                  <li key={x.id}>{x.nom} — {Number(x.vendus)} ventes</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
