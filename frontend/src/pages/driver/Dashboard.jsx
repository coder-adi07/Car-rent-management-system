import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import DriverCard from '../../components/drivers/DriverCard';
import notificationService from '../../services/notification.service';
import driverService from '../../services/driver.service';

const DriverDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [driverProfile, setDriverProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState(location.state?.message || null);

  useEffect(() => {
    const fetchDriverData = async () => {
      setLoading(true);
      try {
        const notifRes = await notificationService.getMyNotifications({ isRead: false, limit: 100 });
        if (notifRes.success && notifRes.data?.pagination) {
          setUnreadNotifCount(notifRes.data.pagination.total);
        }

        const profileRes = await driverService.getDriverMe();
        if (profileRes.success && profileRes.data?.driver) {
          setDriverProfile(profileRes.data.driver);
        }
      } catch (err) {
        console.error('Error loading driver dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Success Alert Banner */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-sm font-semibold flex items-center justify-between shadow-sm">
            <span>✅ {successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold text-gray-500 hover:text-gray-800">
              ✕
            </button>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-orange-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="bg-amber-800/60 text-amber-100 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              👨‍✈️ ড্রাইভার পোর্টাল
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">স্বাগতম, {user?.name || 'ড্রাইভার'}!</h1>
            <p className="text-amber-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              গাড়ি লাগবে প্লাটফর্মে আপনাকে স্বাগতম। আপনার ড্রাইভার প্রোফাইল ও গাড়ি সম্পর্কিত তথ্যাদি পর্যালোচনা করুন।
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/driver/profile/edit"
              className="px-5 py-2.5 bg-white text-amber-900 font-extrabold text-xs rounded-xl shadow hover:bg-amber-50 transition flex items-center gap-1.5"
            >
              <span>✏️</span> প্রোফাইল সম্পাদনা (Edit Profile)
            </Link>
            <Link
              to="/notifications"
              className="px-5 py-2.5 bg-amber-800/80 text-white font-extrabold text-xs rounded-xl shadow hover:bg-amber-900 transition flex items-center gap-1.5 border border-amber-500/40"
            >
              <span>🔔</span> নোটিফিকেশন ({unreadNotifCount})
            </Link>
          </div>
        </div>

        {/* Driver Profile Card */}
        {driverProfile && (
          <DriverCard driver={driverProfile} title="👨‍✈️ আমার ড্রাইভার প্রোফাইল ও ছবি" />
        )}

        {/* Stats & Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">লাইসেন্স নম্বর</span>
            <p className="text-base font-extrabold text-gray-900">
              {loading ? '...' : driverProfile?.licenseNumber || driverProfile?.drivingLicenseNumber || 'তথ্য নেই'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">ড্রাইভিং অভিজ্ঞতা</span>
            <p className="text-base font-extrabold text-gray-900">
              {loading ? '...' : driverProfile?.experienceYears ? `${driverProfile.experienceYears} বছর` : 'নির্ধারিত নয়'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block">অ্যাসোইনমেন্ট স্ট্যাটাস</span>
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              {loading ? '...' : driverProfile?.status || 'সক্রিয়'}
            </span>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-gray-900">⚡ দ্রুত নেভিগেশন</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/driver/profile/edit"
              className="p-6 bg-white hover:bg-emerald-50/70 transition rounded-2xl border border-emerald-200 shadow-sm flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                ✏️
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 group-hover:text-emerald-700">প্রোফাইল সম্পাদন (Edit Profile)</h4>
                <p className="text-xs text-gray-500">ছবি, ঠিকানা ও লাইসেন্স তথ্য আপডেট</p>
              </div>
            </Link>

            <Link
              to="/notifications"
              className="p-6 bg-white hover:bg-blue-50/60 transition rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                🔔
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 group-hover:text-blue-700">আমার নোটিফিকেশনসমূহ</h4>
                <p className="text-xs text-gray-500">বুকিং অ্যালার্ট ও বার্তা দেখুন</p>
              </div>
            </Link>

            <Link
              to="/"
              className="p-6 bg-white hover:bg-emerald-50/60 transition rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                🌐
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900 group-hover:text-emerald-700">প্রধান ওয়েবসাইট</h4>
                <p className="text-xs text-gray-500">হোম পেজে ফিরে যান</p>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DriverDashboard;
