import { BookOpen, LogOut } from 'lucide-react';
import { useAuth } from './context/useAuth';
import { useHashRoute } from './hooks/useHashRoute';
import Auth from './components/Auth';
import RoomsPage from './components/RoomsPage';
import RoomPage from './components/RoomPage';

export default function App() {
  const { user, logout } = useAuth();
  const [path, navigate] = useHashRoute();

  if (!user) {
    return <Auth />;
  }

  const roomMatch = path.match(/^\/rooms\/([^/]+)$/);

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="logo" href="#/">
            <span className="logo-mark"><BookOpen size={18} /></span>
            StudyRoom
          </a>

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

      {roomMatch ? (
        // key resets the page state when switching rooms
        <RoomPage key={roomMatch[1]} roomId={roomMatch[1]} navigate={navigate} />
      ) : (
        <RoomsPage navigate={navigate} />
      )}
    </>
  );
}
