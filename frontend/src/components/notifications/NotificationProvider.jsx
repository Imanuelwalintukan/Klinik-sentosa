// NotificationProvider.jsx
import React, { createContext, useContext, useReducer } from 'react';

// Membuat context untuk notifikasi
const NotificationContext = createContext();

// Reducer untuk mengelola state notifikasi
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload.id)
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
    default:
      return state;
  }
};

// Provider komponen untuk menyediakan state notifikasi
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: []
  });

  // Fungsi untuk menambahkan notifikasi
  const addNotification = (notificationData) => {
    const notification = {
      id: Date.now(),
      ...notificationData,
      timestamp: new Date()
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    
    // Otomatis menghapus notifikasi setelah 5 detik
    setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
  };

  // Fungsi untuk menghapus notifikasi
  const removeNotification = (id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: { id } });
  };

  // Fungsi untuk menghapus semua notifikasi
  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications: state.notifications, 
      addNotification, 
      removeNotification,
      clearNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook untuk menggunakan context notifikasi
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};