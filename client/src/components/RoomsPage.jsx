import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Users, RefreshCw, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/useAuth';
import { isMine, formatDate } from '../utils/format';
import RoomFormModal from './RoomFormModal';
import { ConfirmModal, ErrorAlert } from './Modal';

export default function RoomsPage({ navigate }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all' | 'mine'
  const [modal, setModal] = useState(null); // { type: 'create' | 'edit' | 'delete', room? }

  useEffect(() => {
    let cancelled = false;
    api.rooms
      .list()
      .then((data) => !cancelled && (setRooms(data), setError('')))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const reload = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const closeModal = () => setModal(null);

  const onSaved = (saved) => {
    closeModal();
    if (modal.type === 'create') {
      navigate(`/rooms/${saved._id}`);
    } else {
      // Keep the populated creator info we already have
      setRooms((list) => list.map((r) => (r._id === saved._id ? { ...r, ...saved, createdBy: r.createdBy } : r)));
    }
  };

  const deleteRoom = async () => {
    await api.rooms.remove(modal.room._id);
    setRooms((list) => list.filter((r) => r._id !== modal.room._id));
    closeModal();
  };

  const visible = filter === 'mine' ? rooms.filter((r) => isMine(r.createdBy, user)) : rooms;

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <h1>Study rooms</h1>
          <p className="muted">Hi {user.username}! Pick a room to start chatting, or create your own.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ type: 'create' })}>
          <Plus size={18} /> New room
        </button>
      </section>

      <div className="toolbar">
        <div className="tabs tabs-inline" role="tablist" aria-label="Filter rooms">
          <button type="button" role="tab" className="tab" aria-selected={filter === 'all'} onClick={() => setFilter('all')}>
            All rooms
          </button>
          <button type="button" role="tab" className="tab" aria-selected={filter === 'mine'} onClick={() => setFilter('mine')}>
            My rooms
          </button>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={reload} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="state card">
          <ErrorAlert message={error} />
          <button type="button" className="btn btn-ghost" onClick={reload}>Try again</button>
        </div>
      )}

      {!error && loading && rooms.length === 0 && (
        <div className="room-grid" aria-busy="true" aria-label="Loading rooms">
          {[0, 1, 2].map((i) => <div key={i} className="card room-card skeleton" />)}
        </div>
      )}

      {!error && !loading && visible.length === 0 && (
        <div className="state card">
          <span className="stat-icon rose"><Users size={22} /></span>
          <h3>{filter === 'mine' ? "You haven't created any rooms yet" : 'No rooms yet'}</h3>
          <p className="muted">Create the first one for your course.</p>
          <button type="button" className="btn btn-primary" onClick={() => setModal({ type: 'create' })}>
            <Plus size={18} /> New room
          </button>
        </div>
      )}

      {!error && visible.length > 0 && (
        <ul className="room-grid">
          {visible.map((room) => {
            const mine = isMine(room.createdBy, user);
            return (
              <li key={room._id} className="card room-card">
                <button type="button" className="room-open" onClick={() => navigate(`/rooms/${room._id}`)}>
                  <span className="room-title">
                    <MessageCircle size={18} />
                    {room.name}
                  </span>
                  {room.description && <span className="room-desc">{room.description}</span>}
                  <span className="room-meta">
                    {mine ? 'Created by you' : `by ${room.createdBy?.username ?? 'unknown'}`} · {formatDate(room.createdAt)}
                  </span>
                </button>
                {mine && (
                  <div className="room-actions">
                    <button type="button" className="icon-btn" aria-label={`Edit ${room.name}`} title="Edit" onClick={() => setModal({ type: 'edit', room })}>
                      <Pencil size={16} />
                    </button>
                    <button type="button" className="icon-btn danger" aria-label={`Delete ${room.name}`} title="Delete" onClick={() => setModal({ type: 'delete', room })}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {(modal?.type === 'create' || modal?.type === 'edit') && (
        <RoomFormModal room={modal.room} onClose={closeModal} onSaved={onSaved} />
      )}
      {modal?.type === 'delete' && (
        <ConfirmModal
          title="Delete room?"
          message={`"${modal.room.name}" and all its messages will be deleted for everyone. This can't be undone.`}
          confirmLabel="Delete room"
          onConfirm={deleteRoom}
          onClose={closeModal}
        />
      )}
    </main>
  );
}
