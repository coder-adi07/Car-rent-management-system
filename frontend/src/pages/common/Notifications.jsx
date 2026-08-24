import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import NotificationItem from '../../components/notifications/NotificationItem';
import notificationService from '../../services/notification.service';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [typeFilter, setTypeFilter] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.getMyNotifications({
        type: typeFilter,
        isRead: unreadOnly ? false : undefined,
        page: pagination.page,
      });
      if (response.success && response.data) {
        setNotifications(response.data.notifications || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'নোটিফিকেশন তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [typeFilter, unreadOnly, pagination.page]);

  const handleMarkRead = async (id) => {
    try {
      const res = await notificationService.markAsRead(id);
      if (res.success) {
        fetchNotifications();
      }
    } catch (err) {
      alert(err.message || 'নোটিফিকেশন আপডেট করা সম্ভব হয়নি।');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res.success) {
        setSuccessMsg('সমস্ত নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে।');
        fetchNotifications();
      }
    } catch (err) {
      alert(err.message || 'পঠিত চিহ্নিত করতে সমস্যা হয়েছে।');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await notificationService.deleteNotification(id);
      if (res.success) {
        setSuccessMsg('নোটিফিকেশন সফলভাবে মুছে ফেলা হয়েছে।');
        fetchNotifications();
      }
    } catch (err) {
      alert(err.message || 'নোটিফিকেশন মুছতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              🔔 আমার নোটিফিকেশনসমূহ (Notifications)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              আপনার বুকিং, পেমেন্ট, রেন্টাল ও অ্যাকাউন্টের সমস্ত আপডেটের অ্যালার্ট দেখুন।
            </p>
          </div>

          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow self-start sm:self-auto"
          >
            ✓ সব পঠিত চিহ্নিত করুন
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 mb-6 text-sm flex items-center justify-between">
            <span>✅ {successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold">✖</button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">টাইপ:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs bg-white font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">সব নোটিফিকেশন (All)</option>
                <option value="booking">বুকিং (Booking)</option>
                <option value="payment">পেমেন্ট (Payment)</option>
                <option value="rental">রেন্টাল (Rental)</option>
                <option value="review">রিভিউ (Review)</option>
                <option value="system">সিস্টেম (System)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => setUnreadOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>শুধু অপঠিত নোটিফিকেশন (Unread Only)</span>
            </label>
          </div>

          <span className="text-xs text-gray-500 font-semibold self-end sm:self-auto">
            মোট পাওয়া গেছে: <strong className="text-emerald-600">{pagination.total}</strong> টি
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">নোটিফিকেশনসমূহ লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center my-6">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold text-red-800 mt-2">ত্রুটি ঘটেছে</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchNotifications}
              className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && notifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-6 shadow-sm">
            <span className="text-5xl">🔔</span>
            <h3 className="text-xl font-bold text-gray-800 mt-3">কোনো নোটিফিকেশন পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-500 mt-1">আপনার ফিল্টার অনুযায়ী কোনো অ্যালার্ট রেকর্ড নেই।</p>
          </div>
        )}

        {/* List */}
        {!loading && !error && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((n) => (
              <NotificationItem
                key={n._id}
                notification={n}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default NotificationsPage;
