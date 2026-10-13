import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { PRIORITY_META, ITEM_STATUS_META } from '../utils/constants';

const STATUS_FILTERS = ['all', 'todo', 'in_progress', 'completed'];
const PRIORITY_FILTERS = ['all', 'high', 'medium', 'low'];

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState(null);
  const [items, setItems] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [conflictItem, setConflictItem] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', estimated_hours: 5 });
  const [savingTask, setSavingTask] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { roadmaps } = await api.listRoadmaps();
      const active = roadmaps.find((r) => r.status === 'active');
      if (!active) { setRoadmap(null); setLoading(false); return; }
      setRoadmap(active);
      const data = await api.getRoadmapItems(active.id);
      setItems(data.items);
      setProgress(data.progress);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const itemById = new Map(items.map((i) => [i.id, i]));

  const handleStatusChange = async (item, newStatus, override = false) => {
    try {
      await api.updateRoadmapItem(item.id, { status: newStatus, override_prerequisite: override });
      load();
    } catch (err) {
      if (err.status === 409 && newStatus === 'completed') {
        setConflictItem(item);
      } else {
        setError(err.message);
      }
    }
  };

  const move = async (item, direction) => {
    const sorted = [...items].sort((a, b) => a.order_index - b.order_index);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const newOrder = [...sorted];
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    try {
      await api.reorderRoadmapItems(roadmap.id, newOrder.map((i) => i.id));
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setSavingTask(true);
    try {
      await api.addRoadmapItem(roadmap.id, taskForm);
      setTaskModalOpen(false);
      setTaskForm({ title: '', description: '', priority: 'medium', estimated_hours: 5 });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTask(false);
    }
  };

  if (loading) return <Loading label="Loading your roadmap…" />;

  if (!roadmap) {
    return (
      <EmptyState
        emoji="🗺️"
        title="No roadmap yet"
        description="Run a skill gap analysis for your target role, then generate a personalized roadmap."
        action={<Link to="/app/analysis" className="btn btn-primary">Go to Skill Gap Analysis</Link>}
      />
    );
  }

  const filtered = items
    .filter((i) => statusFilter === 'all' || i.status === statusFilter)
    .filter((i) => priorityFilter === 'all' || i.priority === priorityFilter)
    .sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="card">
        <div className="spread" style={{ marginBottom: 10 }}>
          <div>
            <h2 style={{ margin: 0 }}>{roadmap.title}</h2>
            <p className="muted" style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
              A personalized, step-by-step plan to close your skill gaps for {roadmap.role_title}.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setTaskModalOpen(true)}>+ Add Task</button>
        </div>
        {progress && (
          <div className="row-wrap">
            <div className="bar-track" style={{ flex: 1, minWidth: 160 }}>
              <div className="bar-fill" style={{ width: `${progress.completion_percent}%` }} />
            </div>
            <span className="muted" style={{ fontSize: '0.85rem' }}>
              {progress.completed_items}/{progress.total_items} complete · {progress.completion_percent}% · {progress.completed_estimated_hours}/{progress.total_estimated_hours}h
            </span>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="row-wrap" style={{ justifyContent: 'space-between' }}>
        <div className="row-wrap">
          <span className="muted" style={{ fontSize: '0.8rem' }}>Status:</span>
          {STATUS_FILTERS.map((s) => (
            <button key={s} className={`chip${statusFilter === s ? ' chip-active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'All' : ITEM_STATUS_META[s].label}
            </button>
          ))}
        </div>
        <div className="row-wrap">
          <span className="muted" style={{ fontSize: '0.8rem' }}>Priority:</span>
          {PRIORITY_FILTERS.map((p) => (
            <button key={p} className={`chip${priorityFilter === p ? ' chip-active' : ''}`} onClick={() => setPriorityFilter(p)}>
              {p === 'all' ? 'All' : PRIORITY_META[p].label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState emoji="🔍" title="No items match these filters" />
      ) : (
        <div className="stack">
          {filtered.map((item, idx) => {
            const prereq = item.prerequisite_item_id ? itemById.get(item.prerequisite_item_id) : null;
            const expanded = expandedId === item.id;
            return (
              <div key={item.id} className="card card-tight">
                <div className="spread" style={{ cursor: 'pointer' }} onClick={() => setExpandedId(expanded ? null : item.id)}>
                  <div className="row" style={{ gap: 12 }}>
                    <span style={{ fontSize: '1.1rem' }}>{item.item_type === 'task' ? '📌' : '🎯'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.title}</div>
                      <div className="faint" style={{ fontSize: '0.76rem' }}>
                        {item.estimated_hours}h · {prereq ? `Requires: ${prereq.title}` : 'No prerequisites'}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <span className={`badge ${PRIORITY_META[item.priority].badge}`}>{PRIORITY_META[item.priority].label}</span>
                    <span className={`badge ${ITEM_STATUS_META[item.status].badge}`}>{ITEM_STATUS_META[item.status].label}</span>
                  </div>
                </div>

                {expanded && (
                  <div className="stack" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-soft)' }} onClick={(e) => e.stopPropagation()}>
                    {item.description && <p className="muted" style={{ fontSize: '0.86rem', margin: 0 }}>{item.description}</p>}
                    <div className="row-wrap">
                      {item.status !== 'in_progress' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(item, 'in_progress')}>Mark In Progress</button>
                      )}
                      {item.status !== 'completed' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleStatusChange(item, 'completed')}>Mark Complete</button>
                      )}
                      {item.status !== 'todo' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(item, 'todo')}>Reset to To Do</button>
                      )}
                      {statusFilter === 'all' && priorityFilter === 'all' ? (
                        <>
                          <button className="icon-btn" onClick={() => move(item, 'up')} disabled={idx === 0} aria-label="Move up">↑</button>
                          <button className="icon-btn" onClick={() => move(item, 'down')} disabled={idx === filtered.length - 1} aria-label="Move down">↓</button>
                        </>
                      ) : (
                        <span className="faint" style={{ fontSize: '0.76rem' }}>Clear filters to reorder</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {conflictItem && (
        <Modal
          title="Prerequisite not completed"
          onClose={() => setConflictItem(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setConflictItem(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                onClick={() => { handleStatusChange(conflictItem, 'completed', true); setConflictItem(null); }}
              >
                Complete Anyway
              </button>
            </>
          }
        >
          <p>
            <strong>{conflictItem.title}</strong> depends on a prerequisite skill that isn't completed yet.
            You can override this dependency if you've already learned it elsewhere.
          </p>
        </Modal>
      )}

      {taskModalOpen && (
        <Modal title="Add Personal Task" onClose={() => setTaskModalOpen(false)}>
          <form className="stack" onSubmit={handleAddTask}>
            <div className="field">
              <label htmlFor="task-title">Title</label>
              <input id="task-title" className="input" required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="task-desc">Description</label>
              <textarea id="task-desc" className="input" rows={3} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="task-priority">Priority</label>
                <select id="task-priority" className="select" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="task-hours">Estimated hours</label>
                <input id="task-hours" type="number" min={0} max={200} className="input" value={taskForm.estimated_hours} onChange={(e) => setTaskForm({ ...taskForm, estimated_hours: Number(e.target.value) })} />
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setTaskModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={savingTask}>{savingTask ? 'Adding…' : 'Add Task'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
