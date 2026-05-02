import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { authStorage } from '../api/storage';
import { getMe, login as apiLogin, logout as apiLogout } from '../api/client';

const AuthContext = createContext(null);

const normalizeLogin = (payload) => {
  const data = payload?.data || payload || {};
  const user = data.user || data.data?.user || data.account || data;
  const token = data.token || data.accessToken || data.jwt || data.data?.token;
  return { user, token };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const bootstrap = useCallback(async () => {
    try {
      const cachedUser = await authStorage.getUser();
      const token = await authStorage.getToken();
      if (cachedUser && token) setUser(cachedUser);
      if (token) {
        const res = await getMe();
        setUser(res.data);
        await authStorage.setSession(res.data, token);
      }
    } catch {
      setUser(null);
      await authStorage.clearSession();
    } finally {
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const signIn = useCallback(async (email, password) => {
    const response = await apiLogin(email, password);
    const { user: nextUser, token } = normalizeLogin(response);
    if (!token || !nextUser) throw new Error('Login response did not include a valid token and user.');
    await authStorage.setSession(nextUser, token);
    setUser(nextUser);
    return nextUser;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // The local session is still cleared when the server is unreachable.
    }
    await authStorage.clearSession();
    setUser(null);
  }, []);

  const updateUser = useCallback(async (updater) => {
    setUser((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      authStorage.getToken().then((token) => {
        if (token) authStorage.setSession(next, token).catch(() => Alert.alert('Profile', 'Could not persist profile changes.'));
      });
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, loading: booting, signIn, signOut, updateUser, refreshUser: bootstrap }),
    [bootstrap, booting, signIn, signOut, updateUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
