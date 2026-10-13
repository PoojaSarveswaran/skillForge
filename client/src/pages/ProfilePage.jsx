import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';
import Loading from '../components/Loading';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    api.listRoles().then((d) => setRoles(d.roles));
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        display_name: user.display_name || '',
        education_stage: user.education_stage || '',
        weekly_availability_hours: user.weekly_availability_hours ?? 5,
        career_goals: user.career_goals || '',
        target_role_id: user.target_role_id || '',
      });
    }
  }, [user]);

  if (!form) return <Loading label="Loading profile…" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.updateProfile({
        ...form,
        target_role_id: form.target_role_id ? Number(form.target_role_id) : null,
        weekly_availability_hours: Number(form.weekly_availability_hours),
      });
      await refreshUser();
      setSuccess('Profile saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await api.resetProfileData();
      await refreshUser();
      setResetModalOpen(false);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="stack" style={{ gap: 20, maxWidth: 720 }}>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="section-heading"><h2>Your Profile</h2></div>
        <form className="stack" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="display_name">Display name</label>
            <input id="display_name" className="input" value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} required />
          </div>
          <div className="field">
            <label htmlFor="education_stage">Current education / professional stage</label>
            <input
              id="education_stage"
              className="input"
              placeholder="e.g. B.E CSE (2024-2028)"
              value={form.education_stage}
              onChange={(e) => setForm({ ...form, education_stage: e.target.value })}
            />
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="target_role_id">Target career path</label>
              <select id="target_role_id" className="select" value={form.target_role_id} onChange={(e) => setForm({ ...form, target_role_id: e.target.value })}>
                <option value="">Not selected</option>
                {roles.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="weekly_availability_hours">Weekly learning availability (hours)</label>
              <input
                id="weekly_availability_hours"
                type="number"
                min={0}
                max={168}
                className="input"
                value={form.weekly_availability_hours}
                onChange={(e) => setForm({ ...form, weekly_availability_hours: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="career_goals">Career preparation goals</label>
            <textarea
              id="career_goals"
              className="input"
              rows={4}
              value={form.career_goals}
              onChange={(e) => setForm({ ...form, career_goals: e.target.value })}
            />
          </div>
          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="section-heading"><h2>Account</h2></div>
        <p className="muted" style={{ fontSize: '0.86rem' }}>Signed in as {user.email}.</p>
        <p className="faint" style={{ fontSize: '0.78rem' }}>
          Demo-grade authentication only — no password reset email, no external identity provider.
        </p>
      </div>

      <div className="card" style={{ borderColor: 'rgba(239,68,68,0.35)' }}>
        <div className="section-heading"><h2 style={{ color: 'var(--critical)' }}>Danger Zone</h2></div>
        <p className="muted" style={{ fontSize: '0.86rem' }}>
          Reset all your skills, roadmap, and activity history. Your account and login stay intact.
        </p>
        <button className="btn btn-danger" onClick={() => setResetModalOpen(true)}>Reset My Data</button>
      </div>

      {resetModalOpen && (
        <Modal
          title="Reset all your data?"
          onClose={() => setResetModalOpen(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setResetModalOpen(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleReset} disabled={resetting}>
                {resetting ? 'Resetting…' : 'Yes, reset everything'}
              </button>
            </>
          }
        >
          <p>This permanently deletes your skills, roadmap, and activity history. This cannot be undone.</p>
        </Modal>
      )}
    </div>
  );
}
