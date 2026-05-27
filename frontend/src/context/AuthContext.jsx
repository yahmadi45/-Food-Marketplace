import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import api, { setAuthToken } from '../api.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'fm_token';

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useLayoutEffect(() => {
    setAuthToken(token);
  }, [token]);

  const refreshMe = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    setAuthToken(token);
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setTokenState(null);
      setUser(null);
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const setToken = (t) => {
    if (t) localStorage.setItem(STORAGE_KEY, t);
    else localStorage.removeItem(STORAGE_KEY);
    setTokenState(t);
    setAuthToken(t || null);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setToken(data.token);
    setUser({
      id: data.user.id,
      nom: data.user.nom,
      email: data.user.email,
      role: data.user.role,
    });
    setLoading(false);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setToken(data.token);
    setUser({
      id: data.user.id,
      nom: data.user.nom,
      email: data.user.email,
      role: data.user.role,
    });
    setLoading(false);
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      login,
      register,
      logout,
      refreshMe,
      setUser,
    }),
    [token, user, loading, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth hors provider');
  return ctx;
}
