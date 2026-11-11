import { useAuth } from './context/AuthContext';
import Auth from './components/Auth';

export default function App() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '20vh', fontFamily: 'sans-serif' }}>Loading session...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <h1 style={{ color: '#111827', margin: 0 }}>StudyRoom Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>Welcome, <strong>{user.username}</strong>!</span>
          <button 
            onClick={logout} 
            style={{ padding: '0.5rem 1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
          >
            Logout
          </button>
        </div>
      </header>
      <main style={{ marginTop: '2rem' }}>
        <div style={{ padding: '1.5rem', background: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ marginTop: 0, color: '#1f2937' }}>Connection Status: Ready for Rooms & Chat</h3>
          <p style={{ color: '#4b5563', marginBottom: 0 }}>
            Your authentication pipeline is fully operational. Next, we can fetch study rooms from your backend and wire up Socket.IO for real-time messaging!
          </p>
        </div>
      </main>
    </div>
  );
}