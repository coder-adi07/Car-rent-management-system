import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import carService from '../../services/car.service';
import bookingService from '../../services/booking.service';
import rentalService from '../../services/rental.service';
import paymentService from '../../services/payment.service';
import notificationService from '../../services/notification.service';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCars: 0,
    availableCars: 0,
    totalBookings: 0,
    activeRentals: 0,
    totalPayments: 0,
    unreadNotifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      try {
        const [carsRes, bookingsRes, rentalsRes, paymentsRes, notifRes] = await Promise.allSettled([
          carService.getAllCars({ limit: 100 }),
          bookingService.getAllBookings({ limit: 1 }),
          rentalService.getAllRentals({ limit: 1 }),
          paymentService.getAllPayments({ limit: 1 }),
          notificationService.getMyNotifications({ isRead: false, limit: 100 }),
        ]);

        let cTotal = 0, cAvail = 0;
        if (carsRes.status === 'fulfilled' && carsRes.value.success) {
          const cars = carsRes.value.data?.cars || [];
          cTotal = carsRes.value.data?.pagination?.total || cars.length;
          cAvail = cars.filter((c) => c.status === 'available').length;
        }

        let bTotal = 0;
        if (bookingsRes.status === 'fulfilled' && bookingsRes.value.success) {
          bTotal = bookingsRes.value.data?.pagination?.total || 0;
        }

        let rTotal = 0;
        if (rentalsRes.status === 'fulfilled' && rentalsRes.value.success) {
          rTotal = rentalsRes.value.data?.pagination?.total || 0;
        }

        let pTotal = 0;
        if (paymentsRes.status === 'fulfilled' && paymentsRes.value.success) {
          pTotal = paymentsRes.value.data?.pagination?.total || 0;
        }

        let nTotal = 0;
        if (notifRes.status === 'fulfilled' && notifRes.value.success) {
          nTotal = notifRes.value.data?.pagination?.total || 0;
        }

        setStats({
          totalCars: cTotal,
          availableCars: cAvail,
          totalBookings: bTotal,
          activeRentals: rTotal,
          totalPayments: pTotal,
          unreadNotifications: nTotal,
        });
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              👑 কেন্দ্রীয় এডমিন প্যানেল (Control Center)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">স্বাগতম, {user?.name || 'এডমিন'}!</h1>
            <p className="text-gray-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              গাড়ি লাগবে প্লাটফর্মের সমস্ত গাড়ি, বুকিং, পেমেন্ট, রেন্টাল চুক্তি ও রিভিউ নিয়ন্ত্রণ করুন।
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/cars/add"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2"
            >
              ➕ নতুন গাড়ি যোগ করুন
            </Link>
          </div>
        </div>

        {/* High-Level KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-2xl block">🚗</span>
            <span className="text-xs text-gray-500 font-bold block">মোট গাড়ি</span>
            <span className="text-2xl font-extrabold text-gray-900">
              {loading ? '...' : stats.totalCars}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-2xl block">✅</span>
            <span className="text-xs text-gray-500 font-bold block">উপলব্ধ গাড়ি</span>
            <span className="text-2xl font-extrabold text-emerald-600">
              {loading ? '...' : stats.availableCars}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-2xl block">📋</span>
            <span className="text-xs text-gray-500 font-bold block">মোট বুকিং</span>
            <span className="text-2xl font-extrabold text-blue-600">
              {loading ? '...' : stats.totalBookings}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-2xl block">📄</span>
            <span className="text-xs text-gray-500 font-bold block">রেন্টাল চুক্তি</span>
            <span className="text-2xl font-extrabold text-purple-600">
              {loading ? '...' : stats.activeRentals}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-2xl block">💳</span>
            <span className="text-xs text-gray-500 font-bold block">পেমেন্ট রেকর্ড</span>
            <span className="text-2xl font-extrabold text-teal-600">
              {loading ? '...' : stats.totalPayments}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-2xl block">🔔</span>
            <span className="text-xs text-gray-500 font-bold block">নোটিফিকেশন</span>
            <span className="text-2xl font-extrabold text-amber-600">
              {loading ? '...' : stats.unreadNotifications}
            </span>
          </div>
        </div>

        {/* Management Shortcuts Grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-gray-900">🛠️ এডমিন ম্যানেজমেন্ট মডিউল</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link
              to="/admin/cars/add"
              className="p-5 bg-emerald-600 hover:bg-emerald-700 text-white transition rounded-2xl shadow-sm group space-y-2"
            >
              <span className="text-3xl block group-hover:scale-110 transition">➕</span>
              <h4 className="text-sm font-extrabold">নতুন গাড়ি যোগ</h4>
              <p className="text-xs text-emerald-100">গাড়ি ও ছবি আপলোড</p>
            </Link>

            <Link
              to="/admin/cars"
              className="p-5 bg-white hover:bg-emerald-50/60 transition rounded-2xl border border-gray-200 shadow-sm group space-y-2"
            >
              <span className="text-3xl block group-hover:scale-110 transition">🛠️</span>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700">গাড়ি পরিচালনা</h4>
              <p className="text-xs text-gray-500">গাড়ি তালিকা ও এডিট</p>
            </Link>

            <Link
              to="/admin/drivers"
              className="p-5 bg-white hover:bg-amber-50/60 transition rounded-2xl border border-gray-200 shadow-sm group space-y-2"
            >
              <span className="text-3xl block group-hover:scale-110 transition">👨‍✈️</span>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-amber-700">ড্রাইভার লিস্ট</h4>
              <p className="text-xs text-gray-500">অনুমোদন ও নতুন ড্রাইভার</p>
            </Link>

            <Link
              to="/admin/bookings"
              className="p-5 bg-white hover:bg-blue-50/60 transition rounded-2xl border border-gray-200 shadow-sm group space-y-2"
            >
              <span className="text-3xl block group-hover:scale-110 transition">📋</span>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-700">বুকিং লিস্ট</h4>
              <p className="text-xs text-gray-500">অনুমোদন ও ড্রাইভার</p>
            </Link>

            <Link
              to="/admin/payments"
              className="p-5 bg-white hover:bg-purple-50/60 transition rounded-2xl border border-gray-200 shadow-sm group space-y-2"
            >
              <span className="text-3xl block group-hover:scale-110 transition">💳</span>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-purple-700">পেমেন্ট বুক</h4>
              <p className="text-xs text-gray-500">ভেরিফাই ও রিফান্ড</p>
            </Link>

            <Link
              to="/admin/rentals"
              className="p-5 bg-white hover:bg-amber-50/60 transition rounded-2xl border border-gray-200 shadow-sm group space-y-2"
            >
              <span className="text-3xl block group-hover:scale-110 transition">📄</span>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-amber-700">রেন্টাল চুক্তি</h4>
              <p className="text-xs text-gray-500">চুক্তিপত্র ও রিটার্ন</p>
            </Link>

            <Link
              to="/admin/reviews"
              className="p-5 bg-white hover:bg-yellow-50/60 transition rounded-2xl border border-gray-200 shadow-sm group space-y-2"
            >
              <span className="text-3xl block group-hover:scale-110 transition">⭐</span>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-yellow-700">রিভিউ মডারেশন</h4>
              <p className="text-xs text-gray-500">পাবলিশ ও গোপন</p>
            </Link>

            <Link
              to="/notifications"
              className="p-5 bg-white hover:bg-indigo-50/60 transition rounded-2xl border border-gray-200 shadow-sm group space-y-2"
            >
              <span className="text-3xl block group-hover:scale-110 transition">🔔</span>
              <h4 className="text-sm font-bold text-gray-900 group-hover:text-indigo-700">নোটিফিকেশন</h4>
              <p className="text-xs text-gray-500">সিস্টেম অ্যালার্ট</p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
