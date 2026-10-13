export default function ReadinessRing({ value = 0, size = 96, stroke = 10, label }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;
  const color = value >= 70 ? 'var(--success)' : value >= 40 ? 'var(--warning)' : 'var(--critical)';

  return (
    <div
      className="ring"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Readiness score ${value} percent`}
    >
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--surface-alt)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <span className="ring-label">{value}%</span>
      {label && (
        <span style={{ position: 'absolute', bottom: -22, fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      )}
    </div>
  );
}
