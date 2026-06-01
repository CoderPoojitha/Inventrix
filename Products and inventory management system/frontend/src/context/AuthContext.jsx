import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { setToken as saveToken, removeToken as deleteToken, getToken } from '../utils/token';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        deleteToken();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    // OAuth2 expects form-urlencoded data
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    const { access_token } = response.data;
    saveToken(access_token);
    
    // Fetch the user data immediately after login
    const userRes = await api.get('/auth/me');
    setUser(userRes.data);
  };

  const registerUser = async (fullName, email, password) => {
    await api.post('/auth/register', {
      full_name: fullName,
      email,
      password,
    });
    // Auto-login after successful registration
    await login(email, password);
  };

  const logout = () => {
    deleteToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register: registerUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
