import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    password: '',
    adresse: '',
  });
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await register(form);
      nav('/');
    } catch (ex) {
      setMsg(ex.response?.data?.message || 'Erreur à l\'inscription');
    }
  };

  const ch = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: '2.5rem' }}>
      <div className="card" style={{ padding: '1.75rem' }}>
        <h1 style={{ marginTop: 0 }}>Créer un compte</h1>
        <p className="muted">Option A — nom, email, téléphone, mot de passe.</p>
        {msg && <p style={{ color: 'var(--danger)' }}>{msg}</p>}
        <form onSubmit={submit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <label>
            <span className="muted">Nom complet</span>
            <input required style={{ width: '100%', marginTop: '0.35rem' }} value={form.nom} onChange={ch('nom')} />
          </label>
          <label>
            <span className="muted">Email</span>
            <input type="email" required style={{ width: '100%', marginTop: '0.35rem' }} value={form.email} onChange={ch('email')} />
          </label>
          <label>
            <span className="muted">Téléphone</span>
            <input required style={{ width: '100%', marginTop: '0.35rem' }} value={form.telephone} onChange={ch('telephone')} />
          </label>
          <label>
            <span className="muted">Mot de passe</span>
            <input type="password" required minLength={6} style={{ width: '100%', marginTop: '0.35rem' }} value={form.password} onChange={ch('password')} />
          </label>
          <label>
            <span className="muted">Adresse (optionnel)</span>
            <textarea rows={2} style={{ width: '100%', marginTop: '0.35rem' }} value={form.adresse} onChange={ch('adresse')} />
          </label>
          <button type="submit" className="btn btn-primary">
            Créer le compte
          </button>
        </form>
        <p className="muted" style={{ marginTop: '1rem' }}>
          Déjà membre ? <Link to="/connexion">Connexion</Link>
        </p>
      </div>
    </div>
  );
}
