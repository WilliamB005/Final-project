import { BookOpen, LogOut, Users, MessageCircle, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Auth from './components/Auth';

export default function App() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div>
          <div className="spinner" />
          Loading your session…
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <span className="logo">
            <span className="logo-mark"><BookOpen size={18} /></span>
            StudyRoom
          </span>

          <div className="user-chip">
            <span className="avatar" aria-hidden="true">{user.username?.[0]}</span>
            <span className="user-name">{user.username}</span>
            <button type="button" className="btn btn-ghost" onClick={logout}>
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="page">
        <section className="welcome card">
          <h1>Hi {user.username} 👋</h1>
          <p>You're logged in. Study rooms and group chat will show up here next.</p>
          <span className="badge"><CheckCircle2 size={14} /> Authentication connected</span>
        </section>

        <div className="grid">
          <div className="card stat">
            <span className="stat-icon rose"><Users size={20} /></span>
            <div>
              <h3>Study rooms</h3>
              <p>Create a room for your course or join one your classmates made.</p>
            </div>
          </div>
          <div className="card stat">
            <span className="stat-icon sky"><MessageCircle size={20} /></span>
            <div>
              <h3>Group chat</h3>
              <p>Ask questions and share notes with everyone in the room.</p>
            </div>
          </div>
          <div className="card stat">
            <span className="stat-icon teal"><Zap size={20} /></span>
            <div>
              <h3>Real-time</h3>
              <p>New messages appear instantly, no refresh needed. Coming soon.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
