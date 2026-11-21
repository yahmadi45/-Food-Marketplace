import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PASSWORD_RULES = [
  { label: '8 caractères minimum', test: (password) => password.length >= 8 },
  { label: 'Majuscules et minuscules', test: (password) => /[a-z]/.test(password) && /[A-Z]/.test(password) },
  { label: 'Au moins un chiffre ou symbole', test: (password) => /[\d\W]/.test(password) },
];

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const passwordChecks = PASSWORD_RULES.map((rule) => ({ ...rule, met: rule.test(form.password) }));
  const passwordScore = passwordChecks.filter((rule) => rule.met).length;
  const strength = passwordScore === 3 ? 'fort' : passwordScore === 2 ? 'moyen' : 'faible';
  const passwordMismatch = confirmPassword.length > 0 && form.password !== confirmPassword;

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    if (form.password !== confirmPassword) {
      setMsg('Les mots de passe ne correspondent pas.');
      return;
    }

    setBusy(true);
    try {
      await register({ ...form, email: form.email.trim() });
      nav('/');
    } catch (ex) {
      setMsg(ex.response?.data?.message || 'Erreur à l’inscription. Réessayez.');
    } finally {
      setBusy(false);
    }
  };

  const ch = (key) => (e) => {
    setForm((current) => ({ ...current, [key]: e.target.value }));
    setMsg('');
  };

  return (
    <div className="auth-page">
      <Link to="/" className="brand auth-brand" aria-label="Retour à l’accueil Food Marketplace">
        <span className="brand-mark" aria-hidden="true">F</span>
        <span className="brand-copy"><strong>Food Marketplace</strong><small>Les bonnes tables, près de chez vous</small></span>
      </Link>
      <div className="card auth-card">
        <span className="eyebrow">Rejoignez-nous</span>
        <h1>Créer un compte</h1>
        <p>Créez votre espace pour retrouver vos commandes et découvrir les restaurants.</p>
        {msg && <p className="checkout-error" role="alert">{msg}</p>}
        <form onSubmit={submit} className="auth-form" aria-busy={busy}>
          <div className="auth-field">
            <label htmlFor="register-name">Nom complet</label>
            <input id="register-name" autoComplete="name" maxLength={150} required value={form.nom} onChange={ch('nom')} />
          </div>
          <div className="auth-field">
            <label htmlFor="register-email">Adresse e-mail</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              maxLength={150}
              required
              value={form.email}
              onChange={ch('email')}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="register-phone">Téléphone</label>
            <input
              id="register-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={20}
              required
              value={form.telephone}
              onChange={ch('telephone')}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="register-password">Mot de passe</label>
            <div className="password-input-wrap">
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={8}
                required
                value={form.password}
                aria-describedby={form.password ? 'password-help password-strength' : 'password-help'}
                onChange={ch('password')}
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
            <span className="auth-field-help" id="password-help">
              8 caractères minimum. Un mélange de lettres et de chiffres est conseillé.
            </span>
            {form.password && (
              <div className={`password-strength is-${strength}`}>
                <div
                  className="password-strength-track"
                  role="meter"
                  aria-label="Sécurité du mot de passe"
                  aria-valuemin={0}
                  aria-valuemax={3}
                  aria-valuenow={passwordScore}
                  aria-valuetext={strength}
                  id="password-strength"
                >
                  <span style={{ width: `${(passwordScore / 3) * 100}%` }} />
                </div>
                <span className="password-strength-label">Sécurité : {strength}</span>
                <ul className="password-rules">
                  {passwordChecks.map((rule) => (
                    <li key={rule.label} className={rule.met ? 'is-met' : ''}>
                      <span aria-hidden="true">{rule.met ? '✓' : '·'}</span> {rule.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="auth-field">
            <label htmlFor="register-confirm-password">Confirmer le mot de passe</label>
            <div className="password-input-wrap">
              <input
                id="register-confirm-password"
                type={showConfirmation ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                aria-invalid={passwordMismatch}
                aria-describedby={passwordMismatch ? 'confirm-password-error' : undefined}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setMsg('');
                }}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showConfirmation ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                aria-pressed={showConfirmation}
                onClick={() => setShowConfirmation((visible) => !visible)}
              >
                {showConfirmation ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            {passwordMismatch && (
              <span className="field-error" id="confirm-password-error">
                Les mots de passe ne correspondent pas.
              </span>
            )}
          </div>
          <div className="auth-field">
            <label htmlFor="register-address">Adresse <span className="muted">(optionnel)</span></label>
            <textarea id="register-address" autoComplete="street-address" rows={2} value={form.adresse} onChange={ch('adresse')} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Création du compte…' : 'Créer le compte'}
          </button>
        </form>
        <p className="auth-switch">
          Déjà membre ? <Link to="/connexion">Connexion</Link>
        </p>
      </div>
    </div>
  );
}
