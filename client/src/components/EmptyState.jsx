export default function EmptyState({ emoji = '✨', title, description, action }) {
  return (
    <div className="empty-state">
      <div className="emoji">{emoji}</div>
      <h3>{title}</h3>
      {description && <p style={{ maxWidth: 420, margin: '0 auto' }}>{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
