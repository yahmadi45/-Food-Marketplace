import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="container empty-state" style={{ minHeight: '55vh' }}>
      <span className="empty-state-icon" aria-hidden="true">404</span>
      <h1>Cette page n’existe pas</h1>
      <p>Le lien est peut-être incorrect ou la page a été déplacée.</p>
      <Link className="btn btn-primary" to="/">Retour à l’accueil</Link>
    </div>
  );
}
