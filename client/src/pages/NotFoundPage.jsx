import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <EmptyState
        emoji="🧭"
        title="Page not found"
        description="The page you're looking for doesn't exist."
        action={<Link to="/" className="btn btn-primary">Go home</Link>}
      />
    </div>
  );
}
