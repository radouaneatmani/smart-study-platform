import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('smart_study_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('smart_study_token');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
        } catch (err) {
          console.error("Token expir? ou invalide", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    const { token: jwtToken, ...userData } = res.data;
    localStorage.setItem('smart_study_token', jwtToken);
    localStorage.setItem('smart_study_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return res.data;
  };

  const register = async (username, email, password, fullName) => {
    const res = await authApi.register({ username, email, password, fullName });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('smart_study_token');
    localStorage.removeItem('smart_study_user');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await authApi.updateProfile(profileData);
    setUser((prev) => ({ ...prev, ...res.data }));
    return res.data;
  };

  const quickDemoLogin = async () => {
    return login('etudiant', 'etudiant123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
