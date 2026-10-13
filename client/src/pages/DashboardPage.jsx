import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import ProgressDoughnut from '../components/charts/ProgressDoughnut';
import WeeklyActivityBar from '../components/charts/WeeklyActivityBar';
import SkillRadarChart from '../components/charts/SkillRadarChart';
import { PRIORITY_META } from '../utils/constants';

function StatCard({ label, value, sub, tone }) {
  return (
    <div className="card">
      <div className="muted" style={{ fontSize: '0.8rem', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: '1.7rem', fontWeight: 800, color: tone }}>{value}</div>
      {sub && <div className="faint" style={{ fontSize: '0.78rem', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const dash = await api.getDashboard();
        if (!mounted) return;
        setData(dash);
        if (dash.role) {
          const a = await api.getAnalysis(dash.role.id);
          if (mounted) setAnalysis(a);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <Loading label="Loading your dashboard…" />;
  if (error) return <div className="alert alert-error">{error}</div>;

  if (!data.role) {
    return (
      <EmptyState
        emoji="🎯"
        title="Select a target career to get started"
        description="Your dashboard will come alive with readiness scores, gap counts, and a roadmap once you choose a target role."
        action={<Link to="/app/careers" className="btn btn-primary">Explore Career Paths</Link>}
      />
    );
  }

  const radarByCategory = {};
  if (analysis) {
    for (const s of analysis.skills) {
      if (!radarByCategory[s.category]) radarByCategory[s.category] = { current: [], target: [] };
      radarByCategory[s.category].current.push(s.current_proficiency);
      radarByCategory[s.category].target.push(s.target_proficiency);
    }
  }
  const radarLabels = Object.keys(radarByCategory);
  const avg = (arr) => (arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0);
  const radarCurrent = radarLabels.map((l) => avg(radarByCategory[l].current));
  const radarTarget = radarLabels.map((l) => avg(radarByCategory[l].target));

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="card-grid">
        <StatCard label="Career Readiness" value={`${data.readiness_score}%`} sub={`Target: ${data.role.title}`} tone="var(--accent)" />
        <StatCard label="Skills Assessed" value={data.total_skills_assessed} sub="total skills tracked" />
        <StatCard label="Critical Gaps" value={data.critical_gaps ?? 0} sub="skills to focus on" tone="var(--critical)" />
        <StatCard
          label="Roadmap Progress"
          value={data.roadmap_progress ? `${data.roadmap_progress.completion_percent}%` : '—'}
          sub={data.roadmap_progress ? `${data.roadmap_progress.completed_items}/${data.roadmap_progress.total_items} completed` : 'No roadmap yet'}
          tone="var(--teal)"
        />
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="section-heading"><h2>Skill Proficiency Overview</h2></div>
          {radarLabels.length > 0 ? (
            <SkillRadarChart labels={radarLabels} current={radarCurrent} target={radarTarget} />
          ) : (
            <EmptyState emoji="📈" title="No skills yet" description="Add skills to see your proficiency overview." />
          )}
        </div>

        <div className="card">
          <div className="section-heading"><h2>Learning Progress</h2></div>
          {data.roadmap_progress ? (
            <ProgressDoughnut
              completed={data.roadmap_progress.completed_items}
              inProgress={data.roadmap_progress.in_progress_items}
              todo={data.roadmap_progress.todo_items}
            />
          ) : (
            <EmptyState emoji="🗺️" title="No roadmap yet" description="Generate a roadmap from the Skill Gap Analysis page." />
          )}
        </div>

        <div className="card">
          <div className="section-heading"><h2>Weekly Learning Activity</h2></div>
          <WeeklyActivityBar activity={data.weekly_activity} />
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-heading"><h2>Upcoming Milestones</h2></div>
          {data.upcoming_milestones.length === 0 ? (
            <EmptyState emoji="✅" title="Nothing pending" description="Generate or complete your roadmap items to see milestones here." />
          ) : (
            <div className="stack">
              {data.upcoming_milestones.map((m) => (
                <div key={m.id} className="spread card-tight" style={{ background: 'var(--surface-alt)', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.title}</div>
                    <div className="faint" style={{ fontSize: '0.78rem' }}>{m.estimated_hours}h estimated</div>
                  </div>
                  <span className={`badge ${PRIORITY_META[m.priority].badge}`}>{PRIORITY_META[m.priority].label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-heading"><h2>Recommended Next Action</h2></div>
          <p style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>{data.recommended_next_action}</p>
          <Link to="/app/roadmap" className="btn btn-primary btn-sm">Go to Roadmap</Link>
        </div>
      </div>

      <div className="card">
        <div className="section-heading"><h2>Recent Activity</h2></div>
        {data.recent_activity.length === 0 ? (
          <EmptyState emoji="🕒" title="No activity yet" description="Your actions — adding skills, completing milestones — will show up here." />
        ) : (
          <div className="stack">
            {data.recent_activity.map((a) => (
              <div key={a.id} className="row" style={{ fontSize: '0.86rem', borderBottom: '1px solid var(--border-soft)', paddingBottom: 8 }}>
                <span className="faint" style={{ minWidth: 130 }}>{new Date(a.created_at).toLocaleString()}</span>
                <span>{a.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
