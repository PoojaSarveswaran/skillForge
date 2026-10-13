import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card card">
        <h1>Welcome back</h1>
        <p>Log in to continue your SkillForge roadmap.</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form className="stack" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting} style={{ marginTop: 8 }}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 18, fontSize: '0.85rem' }}>
          No account yet? <Link to="/register" style={{ color: 'var(--accent)' }}>Create one</Link>
        </p>
        <p className="faint" style={{ marginTop: 6, fontSize: '0.78rem' }}>
          Demo account: demo@skillforge.ai / DemoPass123!
        </p>
      </div>
    </div>
  );
}
