import { useState } from 'react';
import { BookOpen, MessageCircle, Users, Zap, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, register } = useAuth();

  const switchMode = (login) => {
    setIsLogin(login);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell card">
        <aside className="auth-aside">
          <span className="logo">
            <span className="logo-mark"><BookOpen size={18} /></span>
            StudyRoom
          </span>

          <div>
            <h1>Study together, from anywhere.</h1>
            <p>Join a room for your course, ask questions, and keep the whole group on track.</p>
          </div>

          <ul className="feature-list">
            <li><span className="feature-icon"><Users size={16} /></span>Rooms for every course</li>
            <li><span className="feature-icon"><MessageCircle size={16} /></span>Group chat in one place</li>
            <li><span className="feature-icon"><Zap size={16} /></span>Real-time messages (coming soon)</li>
          </ul>
        </aside>

        <main className="auth-main">
          <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
          <p className="auth-sub">
            {isLogin ? 'Log in to get back to your study rooms.' : 'It takes less than a minute.'}
          </p>

          <div className="tabs" role="tablist" aria-label="Login or register">
            <button type="button" role="tab" className="tab" aria-selected={isLogin} onClick={() => switchMode(true)}>
              Log in
            </button>
            <button type="button" role="tab" className="tab" aria-selected={!isLogin} onClick={() => switchMode(false)}>
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert" role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {!isLogin && (
              <div className="field">
                <label htmlFor="username">Username</label>
                <div className="input-wrap">
                  <User size={16} />
                  <input
                    id="username"
                    className="input"
                    type="text"
                    placeholder="e.g. alice"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    minLength={3}
                    maxLength={30}
                    required
                  />
                </div>
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <div className="input-wrap">
                <Mail size={16} />
                <input
                  id="email"
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <Lock size={16} />
                <input
                  id="password"
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={isLogin ? undefined : 8}
                  required
                />
              </div>
              {!isLogin && <span className="hint">At least 8 characters.</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" className="link-btn" onClick={() => switchMode(!isLogin)}>
              {isLogin ? 'Register' : 'Log in'}
            </button>
          </p>
        </main>
      </div>
    </div>
  );
}
