// NotificationList.jsx
import React from 'react';
import { useNotification } from './NotificationProvider';

const NotificationList = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="notification-list">
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification-item notification-${notification.type || 'info'}`}
          onClick={() => removeNotification(notification.id)}
        >
          <div className="notification-content">
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            <small>{new Date(notification.timestamp).toLocaleString()}</small>
          </div>
          <button className="notification-close">×</button>
        </div>
      ))}
    </div>
  );
};

export default NotificationList;