import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Loading';
import ProficiencyBar from '../components/ProficiencyBar';
import { IMPORTANCE_LABELS, DIFFICULTY_META } from '../utils/constants';

export default function RoleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [role, setRole] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .getRole(id)
      .then((d) => mounted && setRole(d.role))
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  const handleSelect = async () => {
    setSelecting(true);
    try {
      await api.updateProfile({ target_role_id: Number(id) });
      await refreshUser();
      navigate('/app/analysis');
    } catch (err) {
      setError(err.message);
    } finally {
      setSelecting(false);
    }
  };

  if (loading) return <Loading label="Loading role details…" />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!role) return null;

  const isSelected = user?.target_role_id === role.id;

  return (
    <div className="stack" style={{ gap: 20 }}>
      <Link to="/app/careers" className="muted" style={{ fontSize: '0.85rem' }}>&larr; Back to Career Explorer</Link>

      <div className="card row-wrap" style={{ justifyContent: 'space-between' }}>
        <div className="row">
          <span style={{ fontSize: '2.2rem' }}>{role.icon}</span>
          <div>
            <h1 style={{ margin: 0 }}>{role.title}</h1>
            <p className="muted" style={{ margin: '4px 0 0' }}>{role.short_description}</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSelect} disabled={selecting || isSelected}>
          {isSelected ? 'Selected as Target ✓' : selecting ? 'Selecting…' : 'Select This Role'}
        </button>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-heading"><h2>About This Role</h2></div>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>{role.long_description}</p>
        </div>
        <div className="card">
          <div className="section-heading"><h2>Key Responsibilities</h2></div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.9rem', lineHeight: 1.9 }}>
            {role.key_responsibilities.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="section-heading"><h2>Required Skills</h2><span className="muted">{role.skills.length} skills</span></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Category</th>
                <th>Target Level</th>
                <th>Importance</th>
                <th>Prerequisite</th>
              </tr>
            </thead>
            <tbody>
              {role.skills.map((s) => (
                <tr key={s.skill_name}>
                  <td style={{ fontWeight: 600 }}>{s.skill_name}</td>
                  <td className="muted">{s.category}</td>
                  <td><ProficiencyBar level={s.target_proficiency} showLabel={false} /></td>
                  <td>
                    <span className={`badge ${s.importance === 'critical' ? 'badge-critical' : s.importance === 'high' ? 'badge-warning' : 'badge-neutral'}`}>
                      {IMPORTANCE_LABELS[s.importance]}
                    </span>
                  </td>
                  <td className="faint">{s.prerequisite_skill_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {role.example_projects.length > 0 && (
        <div className="card">
          <div className="section-heading"><h2>Example Projects</h2></div>
          <div className="card-grid">
            {role.example_projects.map((p) => (
              <div key={p.id} className="card card-tight" style={{ background: 'var(--surface-alt)' }}>
                <div className="spread">
                  <strong style={{ fontSize: '0.9rem' }}>{p.title}</strong>
                  <span className={`badge ${DIFFICULTY_META[p.difficulty].badge}`}>{DIFFICULTY_META[p.difficulty].label}</span>
                </div>
                <div className="faint" style={{ fontSize: '0.78rem', marginTop: 4 }}>{p.estimated_hours}h estimated</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="section-heading"><h2>Suggested Learning Sequence</h2></div>
        <div className="row-wrap">
          {role.learning_sequence.map((s, i) => (
            <span key={s} className="chip">{i + 1}. {s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
