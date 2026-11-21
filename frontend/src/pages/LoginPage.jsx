import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setBusy(true);
    try {
      await login(email.trim(), password);
      nav('/');
    } catch {
      setMsg('Email ou mot de passe incorrect.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" className="brand auth-brand" aria-label="Retour à l’accueil Food Marketplace">
        <span className="brand-mark" aria-hidden="true">F</span>
        <span className="brand-copy"><strong>Food Marketplace</strong><small>Les bonnes tables, près de chez vous</small></span>
      </Link>
      <div className="card auth-card">
        <span className="eyebrow">Ravi de vous revoir</span>
        <h1>Connexion</h1>
        <p>Connectez-vous pour retrouver votre panier et passer commande.</p>
        {msg && <p className="checkout-error" role="alert">{msg}</p>}
        <form onSubmit={submit} className="auth-form" aria-busy={busy}>
          <div className="auth-field">
            <label htmlFor="login-email">Adresse e-mail</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMsg('');
              }}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="login-password">Mot de passe</label>
            <div className="password-input-wrap">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setMsg('');
                }}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <p className="auth-switch">
          Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
