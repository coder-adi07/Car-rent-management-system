import React from 'react';
import { Link } from 'react-router-dom';

const TYPE_ICONS = {
  booking: '📋',
  payment: '💳',
  rental: '🚗',
  maintenance: '🛠️',
  review: '⭐',
  system: '🔔',
};

const NotificationItem = ({ notification, onMarkRead = null, onDelete = null }) => {
  const icon = TYPE_ICONS[notification.type] || '🔔';

  // Determine target link if available
  let targetLink = null;
  if (notification.relatedBooking) {
    const bId = notification.relatedBooking._id || notification.relatedBooking;
    targetLink = `/customer/bookings/${bId}`;
  } else if (notification.relatedRental) {
    const rId = notification.relatedRental._id || notification.relatedRental;
    targetLink = `/customer/rentals/${rId}`;
  }

  return (
    <div
      className={`p-4 rounded-2xl border transition flex items-start gap-3 ${
        notification.isRead
          ? 'bg-white border-gray-200'
          : 'bg-blue-50/70 border-blue-200 shadow-sm'
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
        {icon}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-gray-900 truncate">
            {notification.title}
          </h4>
          {!notification.isRead && (
            <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" title="নতুন নোটিফিকেশন"></span>
          )}
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          {notification.message}
        </p>

        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
          <span>{new Date(notification.createdAt).toLocaleString('bn-BD')}</span>

          <div className="flex items-center gap-2">
            {targetLink && (
              <Link
                to={targetLink}
                className="text-blue-700 hover:text-blue-800 font-bold"
              >
                বিবরণ দেখুন →
              </Link>
            )}

            {!notification.isRead && onMarkRead && (
              <button
                onClick={() => onMarkRead(notification._id)}
                className="text-emerald-700 hover:text-emerald-800 font-bold px-1.5 py-0.5 rounded bg-emerald-50"
                title="পঠিত চিহ্নিত করুন"
              >
                ✓ পঠিত
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(notification._id)}
                className="text-red-500 hover:text-red-700 font-bold px-1"
                title="মুছে ফেলুন"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
