import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ProficiencyBar from '../components/ProficiencyBar';
import ReadinessRing from '../components/ReadinessRing';
import { STATUS_META, IMPORTANCE_LABELS } from '../utils/constants';

const BUCKET_ORDER = ['critical', 'needs_improvement', 'meets_requirement', 'exceeds_requirement'];

export default function SkillGapAnalysisPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [roleId, setRoleId] = useState(user?.target_role_id || null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFormula, setShowFormula] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.listRoles().then((d) => {
      setRoles(d.roles);
      if (!roleId && d.roles.length > 0) setRoleId(user?.target_role_id || null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!roleId) { setLoading(false); return; }
    setLoading(true);
    api
      .getAnalysis(roleId)
      .then(setAnalysis)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [roleId]);

  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    try {
      await api.createRoadmap({ role_id: roleId });
      navigate('/app/roadmap');
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (!roleId) {
    return (
      <EmptyState
        emoji="🎯"
        title="Choose a role to analyze"
        description="Select a career role below to see how your current skills compare."
        action={
          <select className="select" style={{ maxWidth: 260 }} onChange={(e) => setRoleId(Number(e.target.value))} defaultValue="">
            <option value="" disabled>Select a role…</option>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
        }
      />
    );
  }

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="row-wrap" style={{ justifyContent: 'space-between' }}>
        <div className="field" style={{ maxWidth: 260 }}>
          <label htmlFor="role-select">Selected Role</label>
          <select id="role-select" className="select" value={roleId} onChange={(e) => setRoleId(Number(e.target.value))}>
            {roles.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleGenerateRoadmap} disabled={generating}>
          {generating ? 'Generating…' : 'Generate Learning Roadmap'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loading label="Analyzing your skills…" />
      ) : analysis && (
        <>
          <div className="card row-wrap" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="row" style={{ gap: 24 }}>
              <ReadinessRing value={analysis.overall_score} size={110} />
              <div>
                <h2 style={{ margin: '0 0 4px' }}>Overall Readiness Score</h2>
                <p className="muted" style={{ margin: 0, fontSize: '0.88rem', maxWidth: 420 }}>
                  {analysis.overall_score >= 70
                    ? "You're on track! Keep learning to close the remaining gaps."
                    : analysis.overall_score >= 40
                    ? "Good progress — focus on your critical gaps next."
                    : 'Early stage — start with your critical and foundational skills.'}
                </p>
                <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }} onClick={() => setShowFormula((v) => !v)}>
                  {showFormula ? 'Hide' : 'How is this calculated?'}
                </button>
              </div>
            </div>
            <div className="row-wrap">
              {BUCKET_ORDER.map((key) => (
                <div key={key} className="card card-tight" style={{ minWidth: 130, background: 'var(--surface-alt)' }}>
                  <div className="row"><span>{STATUS_META[key].icon}</span><span className={`badge ${STATUS_META[key].badge}`}>{STATUS_META[key].label}</span></div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 6 }}>{analysis.summary[key]}</div>
                  <div className="faint" style={{ fontSize: '0.74rem' }}>skills</div>
                </div>
              ))}
            </div>
          </div>

          {showFormula && (
            <div className="alert" style={{ background: 'var(--surface-alt)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              {analysis.formula_explanation}
            </div>
          )}

          <div className="card">
            <div className="section-heading"><h2>Skill Comparison</h2><span className="muted">{analysis.skills.length} skills evaluated</span></div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Skill</th>
                    <th>Your Level</th>
                    <th>Target Level</th>
                    <th>Gap</th>
                    <th>Importance</th>
                    <th>Status</th>
                    <th>Next Action</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.skills
                    .slice()
                    .sort((a, b) => BUCKET_ORDER.indexOf(a.status) - BUCKET_ORDER.indexOf(b.status))
                    .map((s) => (
                      <tr key={s.skill_name}>
                        <td style={{ fontWeight: 600 }}>{s.skill_name}</td>
                        <td><ProficiencyBar level={s.current_proficiency} showLabel={false} /></td>
                        <td><ProficiencyBar level={s.target_proficiency} showLabel={false} /></td>
                        <td className={s.gap > 0 ? 'faint' : ''} style={{ fontWeight: 600 }}>{s.gap > 0 ? `-${s.gap}` : s.gap === 0 ? '0' : `+${-s.gap}`}</td>
                        <td>
                          <span className={`badge ${s.importance === 'critical' ? 'badge-critical' : s.importance === 'high' ? 'badge-warning' : 'badge-neutral'}`}>
                            {IMPORTANCE_LABELS[s.importance]}
                          </span>
                        </td>
                        <td><span className={`badge ${STATUS_META[s.status].badge}`}>{STATUS_META[s.status].icon} {STATUS_META[s.status].label}</span></td>
                        <td className="muted" style={{ fontSize: '0.82rem', maxWidth: 220 }}>{s.next_action}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
