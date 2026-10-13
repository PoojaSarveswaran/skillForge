import { Link } from 'react-router-dom';
import { CAREER_PATHS } from '../utils/constants';

const FEATURES = [
  { emoji: '📊', title: 'Skill Gap Analysis', desc: 'Know exactly where you stand against your target role.' },
  { emoji: '🗺️', title: 'Personalized Roadmap', desc: 'A step-by-step learning plan built from your real gaps.' },
  { emoji: '🚀', title: 'Project Recommendations', desc: 'Build real projects that close your specific gaps.' },
  { emoji: '📈', title: 'Track Your Progress', desc: 'Turn learning goals into measurable achievements.' },
];

const STEPS = [
  { title: 'Assess your skills', desc: 'Add your current skills and rate your proficiency from 0 to 4.' },
  { title: 'Pick a target role', desc: 'Choose from six in-demand career paths with transparent requirements.' },
  { title: 'Follow your roadmap', desc: 'Work through a prioritized, dependency-aware learning plan.' },
];

export default function LandingPage() {
  return (
    <div>
      <nav className="landing-nav">
        <div className="row" style={{ fontWeight: 800 }}>
          <span className="logo-mark" style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg, var(--accent), var(--violet))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>⚡</span>
          SkillForge AI
        </div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#paths">Career Paths</a>
          <a href="#how-it-works">How it works</a>
          <Link to="/about">About</Link>
        </div>
        <div className="row">
          <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      <section className="hero">
        <span className="hero-badge">🚀 Your Career Growth Companion</span>
        <h1>
          Build the skills. <span className="accent-text">Close the gaps.</span>{' '}
          <span className="violet-text">Shape your career.</span>
        </h1>
        <p className="lead">
          Understand your current skills, discover what your target role requires, and follow a
          personalized roadmap toward your career goals.
        </p>
        <div className="hero-ctas">
          <Link to="/register" className="btn btn-primary">Get Started Free</Link>
          <Link to="/login" className="btn btn-ghost">I already have an account</Link>
        </div>

        <div className="feature-strip" id="features">
          {FEATURES.map((f) => (
            <div className="feature-item card" key={f.title}>
              <div className="emoji">{f.emoji}</div>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section" id="how-it-works">
        <h2>How it works</h2>
        <p className="section-lead">Three steps from "I don't know what I'm missing" to a concrete learning plan.</p>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div className="step-card card" key={s.title}>
              <div className="step-num">{i + 1}</div>
              <h4 style={{ margin: '0 0 6px' }}>{s.title}</h4>
              <p className="muted" style={{ margin: 0, fontSize: '0.88rem' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section" id="paths">
        <h2>Supported career paths</h2>
        <p className="section-lead">Each path has transparent, editable skill requirements — not a black box.</p>
        <div className="paths-grid">
          {CAREER_PATHS.map((p) => (
            <div className="path-chip card" key={p.title}>
              <span className="emoji">{p.emoji}</span>
              {p.title}
            </div>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <h2>Ready to find your gaps?</h2>
        <p>Create a free account — no payment, no external sign-in required.</p>
        <Link to="/register" className="btn btn-primary">Get Started Free</Link>
      </section>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} SkillForge AI — a student portfolio project.</span>
        <div className="row">
          <Link to="/about">About &amp; Methodology</Link>
        </div>
      </footer>
    </div>
  );
}
