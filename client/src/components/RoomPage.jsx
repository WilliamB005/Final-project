import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Pencil, Trash2, Send, MessageCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/useAuth';
import { isMine, formatTime } from '../utils/format';
import RoomFormModal from './RoomFormModal';
import { ConfirmModal, ErrorAlert } from './Modal';

// How often to check for new messages until real-time (Socket.IO) is added
const POLL_MS = 4000;

export default function RoomPage({ roomId, navigate }) {
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // { message, status }
  const [reloadKey, setReloadKey] = useState(0);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [modal, setModal] = useState(null); // { type: 'edit' | 'deleteRoom' | 'deleteMessage', message? }
  const listRef = useRef(null);

  // Load the room and its messages
  useEffect(() => {
    let cancelled = false;
    Promise.all([api.rooms.get(roomId), api.messages.list(roomId)])
      .then(([roomData, messageData]) => {
        if (cancelled) return;
        setRoom(roomData);
        setMessages(messageData);
        setError(null);
      })
      .catch((err) => !cancelled && setError({ message: err.message, status: err.status }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [roomId, reloadKey]);

  // Poll for new messages while the room is open
  useEffect(() => {
    if (!room) return undefined;
    const id = setInterval(() => {
      api.messages
        .list(roomId)
        .then(setMessages)
        .catch(() => {}); // a missed poll is fine; the next one will retry
    }, POLL_MS);
    return () => clearInterval(id);
  }, [room, roomId]);

  // Scroll to the newest message when the count changes
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const retry = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const send = async (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setSending(true);
    setSendError('');
    try {
      const message = await api.messages.send(roomId, content);
      setMessages((list) => (list.some((m) => m._id === message._id) ? list : [...list, message]));
      setDraft('');
    } catch (err) {
      setSendError(err.message);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    // Enter sends, Shift+Enter adds a new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(e);
    }
  };

  const closeModal = () => setModal(null);

  const deleteMessage = async () => {
    await api.messages.remove(roomId, modal.message._id);
    setMessages((list) => list.filter((m) => m._id !== modal.message._id));
    closeModal();
  };

  const deleteRoom = async () => {
    await api.rooms.remove(roomId);
    navigate('/');
  };

  if (loading && !room) {
    return (
      <main className="page">
        <div className="loading-inline"><div className="spinner" />Loading room…</div>
      </main>
    );
  }

  if (error && !room) {
    return (
      <main className="page">
        <div className="state card">
          <h3>{error.status === 404 || error.status === 400 ? 'Room not found' : "Couldn't load this room"}</h3>
          <p className="muted">
            {error.status === 404 || error.status === 400 ? 'It may have been deleted by its creator.' : error.message}
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
              <ArrowLeft size={16} /> Back to rooms
            </button>
            {error.status !== 404 && error.status !== 400 && (
              <button type="button" className="btn btn-primary" onClick={retry}>Try again</button>
            )}
          </div>
        </div>
      </main>
    );
  }

  const ownsRoom = isMine(room.createdBy, user);

  return (
    <main className="page chat-page">
      <section className="chat card">
        <header className="chat-head">
          <button type="button" className="icon-btn" onClick={() => navigate('/')} aria-label="Back to rooms" title="Back to rooms">
            <ArrowLeft size={18} />
          </button>
          <div className="chat-title">
            <h1>{room.name}</h1>
            {room.description && <p className="muted">{room.description}</p>}
          </div>
          {ownsRoom && (
            <div className="room-actions">
              <button type="button" className="icon-btn" onClick={() => setModal({ type: 'edit' })} aria-label="Edit room" title="Edit room">
                <Pencil size={16} />
              </button>
              <button type="button" className="icon-btn danger" onClick={() => setModal({ type: 'deleteRoom' })} aria-label="Delete room" title="Delete room">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </header>

        <div className="messages" ref={listRef} aria-live="polite">
          {messages.length === 0 ? (
            <div className="messages-empty">
              <span className="stat-icon sky"><MessageCircle size={22} /></span>
              <p>No messages yet. Say hi 👋</p>
            </div>
          ) : (
            messages.map((m) => {
              const mine = isMine(m.sender, user);
              return (
                <div key={m._id} className={`msg ${mine ? 'mine' : ''}`}>
                  <div className="msg-meta">
                    <strong>{mine ? 'You' : m.sender?.username ?? 'unknown'}</strong>
                    <time dateTime={m.createdAt}>{formatTime(m.createdAt)}</time>
                  </div>
                  <div className="msg-row">
                    <p className="bubble">{m.content}</p>
                    {mine && (
                      <button
                        type="button"
                        className="icon-btn msg-delete"
                        onClick={() => setModal({ type: 'deleteMessage', message: m })}
                        aria-label="Delete message"
                        title="Delete message"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form className="composer" onSubmit={send}>
          {sendError && <ErrorAlert message={sendError} />}
          <div className="composer-row">
            <textarea
              className="input input-plain"
              rows={1}
              placeholder={`Message ${room.name}…`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              maxLength={2000}
              aria-label="Message"
            />
            <button type="submit" className="btn btn-primary" disabled={sending || !draft.trim()} aria-label="Send">
              <Send size={16} />
              <span className="hide-sm">{sending ? 'Sending…' : 'Send'}</span>
            </button>
          </div>
        </form>
      </section>

      {modal?.type === 'edit' && (
        <RoomFormModal
          room={room}
          onClose={closeModal}
          onSaved={(saved) => {
            setRoom((r) => ({ ...r, ...saved, createdBy: r.createdBy }));
            closeModal();
          }}
        />
      )}
      {modal?.type === 'deleteRoom' && (
        <ConfirmModal
          title="Delete room?"
          message={`"${room.name}" and all its messages will be deleted for everyone. This can't be undone.`}
          confirmLabel="Delete room"
          onConfirm={deleteRoom}
          onClose={closeModal}
        />
      )}
      {modal?.type === 'deleteMessage' && (
        <ConfirmModal
          title="Delete message?"
          message="This message will be removed for everyone in the room."
          confirmLabel="Delete message"
          onConfirm={deleteMessage}
          onClose={closeModal}
        />
      )}
    </main>
  );
}
