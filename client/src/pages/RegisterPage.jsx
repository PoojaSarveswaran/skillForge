import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ display_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register(form);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Registration failed.');
      setFieldErrors(err.fields || {});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card card">
        <h1>Create your account</h1>
        <p>Demo-grade authentication — no external providers, no real production hardening.</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form className="stack" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="display_name">Display name</label>
            <input
              id="display_name"
              className={`input${fieldErrors.display_name ? ' input-error' : ''}`}
              required
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            />
            {fieldErrors.display_name && <span className="error-text">{fieldErrors.display_name}</span>}
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className={`input${fieldErrors.email ? ' input-error' : ''}`}
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
            {fieldErrors.email && <span className="error-text">{fieldErrors.email}</span>}
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className={`input${fieldErrors.password ? ' input-error' : ''}`}
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
            {fieldErrors.password && <span className="error-text">{fieldErrors.password}</span>}
            <span className="faint" style={{ fontSize: '0.76rem' }}>At least 8 characters.</span>
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting} style={{ marginTop: 8 }}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="muted" style={{ marginTop: 18, fontSize: '0.85rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
