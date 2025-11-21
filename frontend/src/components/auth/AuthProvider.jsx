// AuthProvider.jsx
import React, { createContext, useContext, useReducer } from 'react';

// Membuat context untuk autentikasi
const AuthContext = createContext();

// Reducer untuk mengelola state autentikasi
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        currentUser: action.payload.user,
        isAuthenticated: true
      };
    case 'LOGOUT':
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false
      };
    default:
      return state;
  }
};

// Provider komponen untuk menyediakan state autentikasi
export const AuthProvider = ({ children }) => {
  // Cek apakah ada user yang sudah login sebelumnya dari localStorage
  const storedUser = localStorage.getItem('user');
  const initialState = {
    currentUser: storedUser ? JSON.parse(storedUser) : null,
    isAuthenticated: !!storedUser
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Fungsi login
  const login = (userData) => {
    // Simpan data user ke localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    dispatch({ type: 'LOGIN', payload: { user: userData } });
  };

  // Fungsi logout
  const logout = () => {
    // Hapus data user dari localStorage
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook untuk menggunakan context autentikasi
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};