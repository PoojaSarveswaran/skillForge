import { PROFICIENCY_LABELS } from '../utils/constants';

export default function ProficiencyBar({ level, max = 4, showLabel = true, size = 'md' }) {
  const dots = Array.from({ length: max }, (_, i) => i < level);
  return (
    <div className="row" style={{ gap: 8 }}>
      <div className="proficiency-scale" aria-hidden="true">
        {dots.map((filled, i) => (
          <span key={i} className={`proficiency-dot${filled ? ' filled' : ''}`} />
        ))}
      </div>
      {showLabel && (
        <span className="faint" style={{ fontSize: size === 'sm' ? '0.74rem' : '0.8rem' }}>
          {PROFICIENCY_LABELS[level]} ({level}/{max})
        </span>
      )}
    </div>
  );
}
