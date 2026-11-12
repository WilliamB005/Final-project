import { useCallback, useEffect, useState } from 'react';
import { api, AUTH_EXPIRED_EVENT } from '../services/api';
import { AuthContext } from './useAuth';

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Restore the session saved in localStorage, so a page refresh keeps you logged in
function loadSession() {
  try {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) return JSON.parse(savedUser);
  } catch {
    // corrupted value, fall through and clear it
  }
  clearSession();
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession);
  const [notice, setNotice] = useState('');

  const saveSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    setNotice('');
    return data;
  };

  const login = async (email, password) => saveSession(await api.auth.login(email, password));

  const register = async (username, email, password) => saveSession(await api.auth.register(username, email, password));

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // The API helper fires this when the server answers 401 to a request that had a token
  useEffect(() => {
    const onExpired = () => {
      logout();
      setNotice('Your session expired. Please log in again.');
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, notice }}>
      {children}
    </AuthContext.Provider>
  );
}
