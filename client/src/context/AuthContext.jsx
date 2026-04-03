import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { setAccessToken, setSessionExpiredHandler } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try silent refresh on mount to restore session
  useEffect(() => {
    api
      .post('/auth/refresh')
      .then((res) => {
        setAccessToken(res.data.data.accessToken);
        setUser(res.data.data.user);
      })
      .catch(() => {
        setAccessToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle session expiry (refresh token failed)
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      toast.error('Session expired. Please sign in again.');
      navigate('/login');
    });
    return () => setSessionExpiredHandler(null);
  }, [navigate]);

  const login = useCallback((userData, accessToken) => {
    setAccessToken(accessToken);
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore — clear local state regardless
    }
    setAccessToken(null);
    setUser(null);
    navigate('/');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
