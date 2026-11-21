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

const COLORS = ['#f08a4b', '#65cf98', '#8ca8ff', '#ed88a8', '#65c6b0', '#edc06a'];

export default function AdminDashboard() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then(({ data }) => setD(data))
      .catch(() => setErr('Accès admin refusé ou API indisponible'));
  }, []);

  if (err) return <p className="notice notice-error" role="alert">{err} — vérifiez votre connexion administrateur.</p>;
  if (!d)
    return <p className="muted" role="status">Chargement du tableau de bord…</p>;

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
  const axisTick = { fill: '#a0ada4', fontSize: 11 };
  const tooltipStyle = { background: '#191f1b', color: '#edf2ee', border: '1px solid #303a33', borderRadius: 10 };

  return (
    <div className="admin-page">
      <span className="eyebrow">Vue d’ensemble</span>
      <h1>Dashboard</h1>
      <div className="admin-kpi-grid">
        {kpis.map((k) => (
          <div key={k.label} className="card admin-kpi">
            <div className="admin-kpi-label">{k.label}</div>
            <div className="admin-kpi-value">{k.val}</div>
          </div>
        ))}
      </div>

      <div className="admin-charts-grid">
        <div className="card admin-chart-card">
          <h3>Évolution CA (14 j)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={d.caParJour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#303a33" />
              <XAxis dataKey="jour" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="ca" name="CA (TND)" stroke="#f08a4b" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card admin-chart-card">
          <h3>Commandes par jour</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={d.histogramme_commandes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#303a33" />
              <XAxis dataKey="jour" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="nb" name="Nombre" fill="#65cf98" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-charts-grid">
        <div className="card admin-chart-card">
          <h3>Répartition CA par restaurant</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {pieData.map((_, i) => (
                  <Cell key={String(i)} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card admin-chart-card">
          <h3>Top 5 plats / Flop 5</h3>
          <div className="top-flop-grid">
            <div>
              <strong style={{ color: 'var(--success)' }}>Top 5 vendus</strong>
              <ol style={{ margin: '0.5rem 0 0', paddingLeft: '1rem' }}>
                {(d.top_plats || []).map((x) => (
                  <li key={x.nom}>{x.nom} — {x.vendus} ventes</li>
                ))}
              </ol>
            </div>
            <div>
              <strong style={{ color: 'var(--danger)' }}>Flops (faible rotation)</strong>
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
