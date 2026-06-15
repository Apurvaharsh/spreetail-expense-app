import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

function NotificationsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data) {
        setNotifications(res.data);
        // Simple logic for unread indicator
        if (res.data.length > 0) setUnreadCount(1); 
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0); // clear unread when opened
    }
  };

  const formatTimeAgo = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpen}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors text-on-surface-variant relative ${isOpen ? 'bg-surface-container-low' : 'hover:bg-surface-container-low'}`}
      >
        <span className="material-symbols-outlined text-[20px]" data-icon="notifications">notifications</span>
        {/* Red dot indicator */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full border border-surface"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] bg-surface border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden flex flex-col transform origin-top-right transition-all">
          <div className="px-lg py-md border-b border-surface-container-high flex justify-between items-center bg-surface-container-lowest">
            <h3 className="font-headline-md text-headline-md text-on-surface">Notifications</h3>
          </div>
          
          <div className="max-h-[380px] overflow-y-auto flex flex-col">
            {notifications.length === 0 ? (
              <div className="p-xl text-center text-on-surface-variant font-body-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif, idx) => (
                <div 
                  key={notif.id} 
                  className={`p-md flex items-start gap-md hover:bg-surface-container-lowest transition-colors cursor-pointer ${idx !== notifications.length - 1 ? 'border-b border-surface-container-high/50' : ''}`}
                >
                  <div className="text-[20px] leading-none shrink-0 mt-[2px]">{notif.icon}</div>
                  <div className="flex flex-col gap-[2px]">
                    <p className="font-body-sm text-body-sm text-on-surface leading-snug">{notif.text}</p>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">{formatTimeAgo(notif.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsMenu;
