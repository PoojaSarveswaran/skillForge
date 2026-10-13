import { useEffect, useState } from 'react';
import { api } from '../services/api';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import ProficiencyBar from '../components/ProficiencyBar';
import { PROFICIENCY_LABELS } from '../utils/constants';

const CATEGORY_OPTIONS = ['Frontend', 'Backend', 'Databases', 'AI/ML', 'Data', 'CS Fundamentals', 'DevOps', 'Tools', 'Security', 'Quality', 'Architecture', 'General'];

function emptyForm() {
  return { skill_name: '', category: 'General', proficiency: 1 };
}

export default function SkillAssessmentPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .listSkills({ search, category: category === 'All' ? undefined : category })
      .then((d) => setSkills(d.skills))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (skill) => {
    setEditing(skill);
    setForm({ skill_name: skill.skill_name, category: skill.category, proficiency: skill.proficiency });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});
    try {
      if (editing) {
        await api.updateSkill(editing.id, form);
      } else {
        await api.createSkill(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setFormErrors(err.fields || {});
      if (!err.fields || Object.keys(err.fields).length === 0) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteSkill(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="stack" style={{ gap: 18 }}>
      <div className="row-wrap" style={{ justifyContent: 'space-between' }}>
        <div className="row-wrap">
          <input className="input" style={{ maxWidth: 240 }} placeholder="Search skills…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="select" style={{ maxWidth: 200 }} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>All</option>
            {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Skill</button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loading label="Loading your skills…" />
      ) : skills.length === 0 ? (
        <EmptyState
          emoji="🧠"
          title="No skills added yet"
          description="Add the skills you already have so SkillForge can compare them against your target role."
          action={<button className="btn btn-primary" onClick={openCreate}>+ Add Your First Skill</button>}
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Category</th>
                <th>Proficiency</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.skill_name}</td>
                  <td className="muted">{s.category}</td>
                  <td><ProficiencyBar level={s.proficiency} /></td>
                  <td>
                    <div className="row">
                      <button className="icon-btn" onClick={() => openEdit(s)} aria-label={`Edit ${s.skill_name}`}>✏️</button>
                      <button className="icon-btn" onClick={() => setDeleteTarget(s)} aria-label={`Delete ${s.skill_name}`}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? 'Edit Skill' : 'Add Skill'} onClose={() => setModalOpen(false)}>
          <form className="stack" onSubmit={handleSave}>
            <div className="field">
              <label htmlFor="skill_name">Skill name</label>
              <input
                id="skill_name"
                className={`input${formErrors.skill_name ? ' input-error' : ''}`}
                value={form.skill_name}
                onChange={(e) => setForm({ ...form, skill_name: e.target.value })}
                required
              />
              {formErrors.skill_name && <span className="error-text">{formErrors.skill_name}</span>}
            </div>
            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" className="select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Proficiency: {PROFICIENCY_LABELS[form.proficiency]}</label>
              <div className="row-wrap">
                {[0, 1, 2, 3, 4].map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    className={`chip${form.proficiency === lvl ? ' chip-active' : ''}`}
                    onClick={() => setForm({ ...form, proficiency: lvl })}
                  >
                    {lvl} — {PROFICIENCY_LABELS[lvl]}
                  </button>
                ))}
              </div>
              {formErrors.proficiency && <span className="error-text">{formErrors.proficiency}</span>}
            </div>
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save Skill'}</button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Remove skill?"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Remove</button>
            </>
          }
        >
          <p>Remove <strong>{deleteTarget.skill_name}</strong> from your skill list? This cannot be undone.</p>
        </Modal>
      )}
    </div>
  );
}
