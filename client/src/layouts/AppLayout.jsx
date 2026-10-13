import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV_ITEMS = [
  { to: '/app', label: 'Overview', icon: '🏠', end: true },
  { to: '/app/careers', label: 'Career Explorer', icon: '🧭' },
  { to: '/app/skills', label: 'My Skills', icon: '🧠' },
  { to: '/app/analysis', label: 'Skill Gap Analysis', icon: '📊' },
  { to: '/app/roadmap', label: 'Learning Roadmap', icon: '🗺️' },
  { to: '/app/projects', label: 'Project Lab', icon: '🚀' },
  { to: '/app/profile', label: 'Profile & Settings', icon: '⚙️' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = (user?.display_name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentLabel = NAV_ITEMS.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )?.label;

  return (
    <div className="app-shell">
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-brand">
          <span className="logo-mark">⚡</span>
          <span>SkillForge AI</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer stack">
          <NavLink to="/about" className="sidebar-link">
            <span aria-hidden="true">ℹ️</span>
            <span>About &amp; Methodology</span>
          </NavLink>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="row">
            <button
              className="icon-btn sidebar-toggle"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
            <div className="topbar-title">
              <h1>{currentLabel || 'SkillForge AI'}</h1>
              <p>Welcome back, {user?.display_name?.split(' ')[0] || 'there'}.</p>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="avatar" title={user?.display_name}>{initials}</div>
          </div>
        </header>
        <main className="page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
