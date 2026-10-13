import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { DIFFICULTY_META } from '../utils/constants';

const DIFFICULTY_FILTERS = ['All', 'beginner', 'intermediate', 'advanced'];

function ProjectCard({ project, recommended }) {
  return (
    <div className="card stack">
      <div className="spread">
        <strong>{project.title}</strong>
        <span className={`badge ${DIFFICULTY_META[project.difficulty].badge}`}>{DIFFICULTY_META[project.difficulty].label}</span>
      </div>
      <p className="muted" style={{ fontSize: '0.86rem', margin: 0 }}>{project.description}</p>
      <div className="row-wrap">
        {project.skills.map((s) => (
          <span key={s.skill_name} className={`chip${recommended && project.matched_skills?.includes(s.skill_name) ? ' chip-active' : ''}`}>
            {s.skill_name}{s.is_prerequisite ? ' (prereq)' : ''}
          </span>
        ))}
      </div>
      <div className="faint" style={{ fontSize: '0.78rem' }}>{project.estimated_hours}h estimated</div>
      {recommended && (
        <div className="row-wrap">
          <span className="badge badge-info">{project.match_score}% skill match</span>
          {!project.prerequisites_met && <span className="badge badge-warning">Prerequisite needed</span>}
        </div>
      )}
      <div>
        <div className="faint" style={{ fontSize: '0.76rem', marginBottom: 4 }}>Deliverables:</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem' }}>
          {project.deliverables.map((d) => <li key={d}>{d}</li>)}
        </ul>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState(user?.target_role_id ? 'recommended' : 'all');
  const [projects, setProjects] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const timeout = setTimeout(() => {
      Promise.all([
        api.listProjects({ search, difficulty: difficulty === 'All' ? undefined : difficulty }),
        user?.target_role_id ? api.getRecommendedProjects(user.target_role_id) : Promise.resolve({ projects: [] }),
      ])
        .then(([all, rec]) => {
          if (!mounted) return;
          setProjects(all.projects);
          setRecommended(rec.projects);
        })
        .catch((err) => mounted && setError(err.message))
        .finally(() => mounted && setLoading(false));
    }, 200);
    return () => { mounted = false; clearTimeout(timeout); };
  }, [search, difficulty, user?.target_role_id]);

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row-wrap">
        <button className={`chip${tab === 'recommended' ? ' chip-active' : ''}`} onClick={() => setTab('recommended')}>⭐ Recommended for You</button>
        <button className={`chip${tab === 'all' ? ' chip-active' : ''}`} onClick={() => setTab('all')}>All Projects</button>
      </div>

      {tab === 'all' && (
        <div className="row-wrap">
          <input className="input" style={{ maxWidth: 260 }} placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} />
          {DIFFICULTY_FILTERS.map((d) => (
            <button key={d} className={`chip${difficulty === d ? ' chip-active' : ''}`} onClick={() => setDifficulty(d)}>
              {d === 'All' ? 'All' : DIFFICULTY_META[d].label}
            </button>
          ))}
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loading label="Loading projects…" />
      ) : tab === 'recommended' ? (
        !user?.target_role_id ? (
          <EmptyState emoji="🎯" title="Select a target role first" description="Project recommendations are matched to your current skill gaps for a chosen role." />
        ) : recommended.length === 0 ? (
          <EmptyState emoji="🚀" title="No strong matches yet" description="As you log skill gaps for your target role, matching projects will appear here." />
        ) : (
          <div className="card-grid">
            {recommended.map((p) => <ProjectCard key={p.id} project={p} recommended />)}
          </div>
        )
      ) : projects.length === 0 ? (
        <EmptyState emoji="🔍" title="No projects match your filters" />
      ) : (
        <div className="card-grid">
          {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
