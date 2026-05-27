import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await login(email, password);
      nav('/');
    } catch {
      setMsg('Email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420, paddingTop: '3rem' }}>
      <div className="card" style={{ padding: '1.75rem' }}>
        <h1 style={{ marginTop: 0 }}>Connexion</h1>
        <p className="muted">Option B du DS — email et mot de passe.</p>
        {msg && <p style={{ color: 'var(--danger)' }}>{msg}</p>}
        <form onSubmit={submit} style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          <label>
            <span className="muted">Email</span>
            <input type="email" required style={{ width: '100%', marginTop: '0.35rem' }} value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            <span className="muted">Mot de passe</span>
            <input type="password" required style={{ width: '100%', marginTop: '0.35rem' }} value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button type="submit" className="btn btn-primary">
            Se connecter
          </button>
        </form>
        <p style={{ marginTop: '1.25rem' }} className="muted">
          Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
