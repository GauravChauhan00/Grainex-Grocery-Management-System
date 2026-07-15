import { ArrowLeft, MapPinOff } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="not-found__icon"><MapPinOff size={34} /></div>
      <span>404</span>
      <h2>Page not found</h2>
      <p>The page you opened does not exist in this local application.</p>
      <Link className="button button--primary" to="/dashboard"><ArrowLeft size={17} /> Back to dashboard</Link>
    </div>
  );
}
