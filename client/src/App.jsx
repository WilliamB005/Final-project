import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut } from 'lucide-react';
import { useAuth } from './context/useAuth';
import Auth from './components/Auth';
import RoomsPage from './components/RoomsPage';
import RoomPage from './components/RoomPage';

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Protected pages: nobody logged in -> only the login screen
  if (!user) {
    return <Auth />;
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="logo" to="/">
            <span className="logo-mark"><BookOpen size={18} /></span>
            StudyRoom
          </Link>

          <div className="user-chip">
            <span className="avatar" aria-hidden="true">{user.username?.[0]}</span>
            <span className="user-name">{user.username}</span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Which page to show for which URL */}
      <Routes>
        <Route path="/" element={<RoomsPage />} />
        <Route path="/rooms/:roomId" element={<RoomPage />} />
        {/* Any other URL goes back to the rooms list */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
