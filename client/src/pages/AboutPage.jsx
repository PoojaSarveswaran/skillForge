import { Link } from 'react-router-dom';

function Section({ title, children }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h2 style={{ marginTop: 0, fontSize: '1.05rem' }}>{title}</h2>
      <div style={{ fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>{children}</div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px 70px' }}>
      <Link to="/" className="muted" style={{ fontSize: '0.85rem' }}>&larr; Back to home</Link>
      <h1 style={{ marginTop: 16 }}>About &amp; Methodology</h1>
      <p className="muted" style={{ marginBottom: 30 }}>
        How SkillForge AI works, and what it can't tell you.
      </p>

      <Section title="Purpose">
        <p>
          SkillForge AI helps students and aspiring developers compare their current skills against a
          target career role, see exactly where the gaps are, and follow a structured, prioritized
          learning plan to close them.
        </p>
      </Section>

      <Section title="Proficiency levels">
        <p>Every skill is self-assessed on a 0-4 scale:</p>
        <ul>
          <li><strong>0</strong> — Not learned</li>
          <li><strong>1</strong> — Beginner</li>
          <li><strong>2</strong> — Intermediate</li>
          <li><strong>3</strong> — Advanced</li>
          <li><strong>4</strong> — Proficient</li>
        </ul>
      </Section>

      <Section title="How skill gaps are identified">
        <p>
          For each skill a role requires, we compute <code>gap = target_proficiency - current_proficiency</code>.
          A skill is flagged <strong>critical</strong> when the gap is 2 or more levels and the skill's
          importance is "high" or "critical"; otherwise a positive gap is "needs improvement"; a gap of
          zero "meets requirement"; and a negative gap "exceeds requirement".
        </p>
      </Section>

      <Section title="How role readiness is calculated">
        <p>
          <code>readiness = Σ(min(current, target) / target × importance_weight) / Σ(importance_weight) × 100</code>
        </p>
        <p>Importance weights: low = 1, medium = 2, high = 3, critical = 4.</p>
        <p>
          <strong>Limitation:</strong> this is a planning aid based entirely on self-reported proficiency.
          It is not an objective measure of employability and is not a guarantee of job readiness. Going
          from level 0→1 in a skill counts the same as 3→4, even though the latter is usually harder.
        </p>
      </Section>

      <Section title="How roadmap ordering works">
        <p>
          Roadmap milestones are generated only for skills with a positive gap, then ordered with a
          topological sort over each skill's prerequisite relationship (e.g. Statistics before Machine
          Learning) — so foundational skills always come before the skills that depend on them. Among
          skills with no blocking dependency, higher importance and larger gaps are scheduled first.
        </p>
      </Section>

      <Section title="How project recommendations are selected">
        <p>
          Projects are ranked by how many of the skills they let you practice overlap with your current
          skill gaps for the selected role — a transparent overlap score, not an AI-generated
          recommendation. No external AI model is used anywhere in this version of the app.
        </p>
      </Section>

      <Section title="Limitations of self-assessed proficiency">
        <p>
          Proficiency levels are entered by you, not independently verified. Two people both reporting
          "Advanced" in the same skill may have very different actual ability. Treat every score in this
          app as a planning signal, not a certification.
        </p>
      </Section>
    </div>
  );
}
