import { useState } from 'react';
import { api } from '../services/api';
import Modal, { ErrorAlert } from './Modal';

// Create a room (no `room` prop) or edit an existing one
export default function RoomFormModal({ room, onClose, onSaved }) {
  const editing = Boolean(room);
  const [name, setName] = useState(room?.name ?? '');
  const [description, setDescription] = useState(room?.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = { name: name.trim(), description: description.trim() };
      const saved = editing ? await api.rooms.update(room._id, body) : await api.rooms.create(body);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal title={editing ? 'Edit room' : 'New study room'} onClose={saving ? () => {} : onClose}>
      <form onSubmit={handleSubmit}>
        <ErrorAlert message={error} />

        <div className="field">
          <label htmlFor="room-name">Name</label>
          <input
            id="room-name"
            className="input input-plain"
            placeholder="e.g. Calculus II"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            autoFocus
          />
        </div>

        <div className="field">
          <label htmlFor="room-desc">Description <span className="optional">(optional)</span></label>
          <textarea
            id="room-desc"
            className="input input-plain"
            rows={3}
            placeholder="What will you study here?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
          />
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving || !name.trim()}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create room'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
