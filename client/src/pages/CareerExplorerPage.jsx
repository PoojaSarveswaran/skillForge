import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';

export default function CareerExplorerPage() {
  const { user, refreshUser } = useAuth();
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectingId, setSelectingId] = useState(null);

  useEffect(() => {
    api.listCategories().then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const timeout = setTimeout(() => {
      api
        .listRoles({ category, search })
        .then((d) => mounted && setRoles(d.roles))
        .catch((err) => mounted && setError(err.message))
        .finally(() => mounted && setLoading(false));
    }, 200);
    return () => { mounted = false; clearTimeout(timeout); };
  }, [category, search]);

  const handleSelectRole = async (roleId) => {
    setSelectingId(roleId);
    try {
      await api.updateProfile({ target_role_id: roleId });
      await refreshUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setSelectingId(null);
    }
  };

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row-wrap">
        <input
          className="input"
          style={{ maxWidth: 280 }}
          placeholder="Search career roles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="row-wrap">
          {['All', ...categories].map((c) => (
            <button
              key={c}
              className={`chip${category === c ? ' chip-active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <Loading label="Loading career paths…" />
      ) : roles.length === 0 ? (
        <EmptyState emoji="🔍" title="No roles match your search" description="Try a different keyword or category." />
      ) : (
        <div className="card-grid">
          {roles.map((role) => (
            <div key={role.id} className="card stack">
              <div className="row" style={{ fontSize: '1.6rem' }}>{role.icon}</div>
              <h3 style={{ margin: 0 }}>{role.title}</h3>
              <p className="muted" style={{ fontSize: '0.86rem', minHeight: 40 }}>{role.short_description}</p>
              <div className="row-wrap">
                {role.learning_sequence.slice(0, 3).map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
                {role.learning_sequence.length > 3 && <span className="chip">+{role.learning_sequence.length - 3} more</span>}
              </div>
              <div className="faint" style={{ fontSize: '0.78rem' }}>{role.skill_count} required skills</div>
              <div className="row" style={{ marginTop: 6 }}>
                <Link to={`/app/careers/${role.id}`} className="btn btn-ghost btn-sm">View Details</Link>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleSelectRole(role.id)}
                  disabled={selectingId === role.id}
                >
                  {user?.target_role_id === role.id ? 'Selected ✓' : selectingId === role.id ? 'Selecting…' : 'Select Role'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
