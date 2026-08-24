import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import notificationService from '../../services/notification.service';

const NotificationDropdown = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getMyNotifications({ limit: 5 });
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        // Get total unread count
        const unreadRes = await notificationService.getMyNotifications({ isRead: false, limit: 100 });
        if (unreadRes.success && unreadRes.data?.pagination) {
          setUnreadCount(unreadRes.data.pagination.total);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await notificationService.markAsRead(id);
      if (res.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res.success) {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-gray-600 hover:text-emerald-600 rounded-xl focus:outline-none transition"
        title="নোটিফিকেশনসমূহ"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border border-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden space-y-2">
          <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-gray-900">🔔 নোটিফিকেশন</h4>
              {unreadCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} টি অপঠিত
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold"
              >
                সব পঠিত চিহ্নিত করুন
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 px-2">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">
                কোনো নতুন নোটিফিকেশন নেই।
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-3 text-xs space-y-1 transition ${
                    n.isRead ? 'bg-white' : 'bg-blue-50/60 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-gray-900 truncate">{n.title}</span>
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n._id)}
                        className="text-[10px] text-blue-600 font-bold hover:underline flex-shrink-0"
                      >
                        পঠিত
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 text-[11px] line-clamp-2">{n.message}</p>
                  <span className="text-[10px] text-gray-400 block">
                    {new Date(n.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold block"
            >
              সব নোটিফিকেশন দেখুন →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
