import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import bookingService from '../../services/booking.service';
import rentalService from '../../services/rental.service';
import notificationService from '../../services/notification.service';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeRentals: 0,
    unreadNotifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [bookingsRes, rentalsRes, notifRes] = await Promise.allSettled([
          bookingService.getAllBookings({ limit: 5 }),
          rentalService.getAllRentals({ limit: 5 }),
          notificationService.getMyNotifications({ isRead: false, limit: 100 }),
        ]);

        let bCount = 0;
        if (bookingsRes.status === 'fulfilled' && bookingsRes.value.success) {
          bCount = bookingsRes.value.data?.pagination?.total || bookingsRes.value.data?.bookings?.length || 0;
        }

        let rCount = 0;
        if (rentalsRes.status === 'fulfilled' && rentalsRes.value.success) {
          rCount = rentalsRes.value.data?.pagination?.total || rentalsRes.value.data?.rentals?.length || 0;
        }

        let nCount = 0;
        if (notifRes.status === 'fulfilled' && notifRes.value.success) {
          nCount = notifRes.value.data?.pagination?.total || notifRes.value.data?.notifications?.length || 0;
        }

        setStats({
          totalBookings: bCount,
          activeRentals: rCount,
          unreadNotifications: nCount,
        });
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-emerald-800/60 text-emerald-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              👤 কাস্টমার পোর্টাল
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">স্বাগতম, {user?.name || 'গ্রাহক'}!</h1>
            <p className="text-emerald-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              গাড়ি লাগবে প্লাটফর্মে আপনাকে স্বাগতম। আপনার বুকিং, পেমেন্ট, রেন্টাল চুক্তি ও রিভিউসমূহ এক জায়গা থেকে পরিচালনা করুন।
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/cars"
              className="px-5 py-2.5 bg-white text-emerald-800 font-extrabold text-xs rounded-xl shadow hover:bg-emerald-50 transition"
            >
              🚗 নতুন গাড়ি বুক করুন
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
              📋
            </div>
            <div>
              <span className="text-xs text-gray-500 font-semibold block">আমার মোট বুকিং</span>
              <span className="text-2xl font-extrabold text-gray-900">
                {loading ? '...' : stats.totalBookings}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold">
              🚗
            </div>
            <div>
              <span className="text-xs text-gray-500 font-semibold block">সক্রিয় রেন্টাল</span>
              <span className="text-2xl font-extrabold text-gray-900">
                {loading ? '...' : stats.activeRentals}
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
              🔔
            </div>
            <div>
              <span className="text-xs text-gray-500 font-semibold block">অপঠিত নোটিফিকেশন</span>
              <span className="text-2xl font-extrabold text-gray-900">
                {loading ? '...' : stats.unreadNotifications}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-gray-900">⚡ দ্রুত সেবা ও ড্যাশবোর্ড সেকশন</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link
              to="/customer/bookings"
              className="p-5 bg-white hover:bg-emerald-50/60 transition rounded-2xl border border-gray-200 shadow-sm group space-y-2"
            >
              <span className="text-3xl block group-hover:scale-110 transition">📋</span>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700">আমার বুকিং</h4>
              <p className="text-xs text-gray-500">বুকিং তালিকা ও বিস্তারিত</p>
            </Link>

            <Link
              to="/customer/payments"
              className="p-5 bg-white hover:bg-teal-50/60 transition rounded-2xl border border-gray-200 shadow-sm group space-y-2"
            >
              <span className="text-3xl block group-hover:scale-110 transition">💳</span>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-teal-700">আমার পেমেন্ট</h4>
              <p className="text-xs text-gray-500">পেমেন্ট রসিদ ও ইতিহাস</p>
            </Link>

            <Link
              to="/customer/rentals"
              className="p-5 bg-white hover:bg-cyan-50/60 transition rounded-2xl border border-gray-200 shadow-sm group space-y-2"
            >
              <span className="text-3xl block group-hover:scale-110 transition">🚗</span>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-cyan-700">আমার রেন্টাল</h4>
              <p className="text-xs text-gray-500">চুক্তিপত্র ও রেন্টাল হিস্ট্রি</p>
            </Link>

            <Link
              to="/customer/reviews"
              className="p-5 bg-white hover:bg-amber-50/60 transition rounded-2xl border border-gray-200 shadow-sm group space-y-2"
            >
              <span className="text-3xl block group-hover:scale-110 transition">⭐</span>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-amber-700">আমার রিভিউ</h4>
              <p className="text-xs text-gray-500">রেটিং ও মন্তব্যসমূহ</p>
            </Link>

            <Link
              to="/notifications"
              className="p-5 bg-white hover:bg-blue-50/60 transition rounded-2xl border border-gray-200 shadow-sm group space-y-2"
            >
              <span className="text-3xl block group-hover:scale-110 transition">🔔</span>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-700">নোটিফিকেশন</h4>
              <p className="text-xs text-gray-500">রিয়েল-টাইম অ্যালার্ট</p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CustomerDashboard;
