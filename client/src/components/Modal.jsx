import { useEffect } from 'react';

export default function Modal({ title, children, onClose, footer }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="spread" style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>
        <div className="stack">{children}</div>
        {footer && <div className="row" style={{ justifyContent: 'flex-end', marginTop: 20 }}>{footer}</div>}
      </div>
    </div>
  );
}
