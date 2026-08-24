import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import driverService from '../../services/driver.service';
import { getImageUrl } from '../../utils/imageUrl';

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');

  // Add Driver Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newDriver, setNewDriver] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    licenseNumber: '',
    experienceYears: 2,
    profileImage: '',
  });

  // Action Loading State
  const [actionDriverId, setActionDriverId] = useState(null);

  const fetchDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await driverService.getAllDrivers({
        status: filterStatus || undefined,
        search: search.trim() || undefined,
        limit: 50,
      });
      if (res.success && res.data) {
        setDrivers(res.data.drivers || []);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'ড্রাইভার তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDrivers();
  };

  const handleVerifyDriver = async (driverId, isVerified, status) => {
    setActionDriverId(driverId);
    try {
      const res = await driverService.verifyDriver(driverId, { isVerified, status });
      if (res.success) {
        setSuccessMsg(res.message || 'ড্রাইভার স্ট্যাটাস সফলভাবে আপডেট হয়েছে।');
        fetchDrivers();
      }
    } catch (err) {
      alert(err.message || 'স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে।');
    } finally {
      setActionDriverId(null);
    }
  };

  const handleCreateDriverSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await driverService.createDriver(newDriver);
      if (res.success) {
        setSuccessMsg(`নতুন ড্রাইভার "${newDriver.name}" সফলভাবে তৈরি করা হয়েছে!`);
        setAddModalOpen(false);
        setNewDriver({
          name: '',
          email: '',
          phone: '',
          password: '',
          licenseNumber: '',
          experienceYears: 2,
          profileImage: '',
        });
        fetchDrivers();
      }
    } catch (err) {
      alert(err.message || 'নতুন ড্রাইভার যোগ করতে সমস্যা হয়েছে।');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              👑 কেন্দ্রীয় এডমিন মডিউল
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
              👨‍✈️ ড্রাইভার ব্যবস্থাপনা ও ভেরিফিকেশন (Driver Control)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              নতুন ড্রাইভার আবেদন অনুমোদন, লাইসেন্স যাচাইকরণ ও এডমিন প্যানেল থেকে নতুন ড্রাইভার সরাসরি যুক্ত করুন।
            </p>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow transition flex items-center gap-2 self-start sm:self-auto"
          >
            <span>➕</span> নতুন ড্রাইভার যোগ করুন
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-sm font-semibold flex items-center justify-between shadow-sm">
            <span>✅ {successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold text-gray-500 hover:text-gray-800">
              ✕
            </button>
          </div>
        )}

        {/* Filter & Search */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {[
              { label: 'সকল ড্রাইভার', value: '' },
              { label: '⏳ নতুন রেজিস্ট্রেশন (Pending)', value: 'pending' },
              { label: '✅ উপলব্ধ (Available)', value: 'available' },
              { label: '🚘 ট্রিপে ব্যস্ত (Busy)', value: 'busy' },
              { label: '⛔ স্থগিত (Suspended)', value: 'suspended' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  filterStatus === tab.value
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="নাম, ফোন বা লাইসেন্স..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3.5 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 w-full md:w-60"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition"
            >
              খুঁজুন
            </button>
          </form>
        </div>

        {/* Drivers Table */}
        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">ড্রাইভারদের তালিকা লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-700 rounded-3xl border border-red-200 text-center font-semibold">
            {error}
          </div>
        ) : drivers.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 space-y-3">
            <span className="text-5xl">👨‍✈️</span>
            <h3 className="text-lg font-bold text-gray-800">কোনো ড্রাইভার পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-500">বর্তমানে আপনার পছন্দের ফিল্টারে কোনো ড্রাইভারের তথ্য নেই।</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-4">ড্রাইভারের ছবি ও নাম</th>
                    <th className="px-5 py-4">যোগাযোগ (ফোন/ইমেইল)</th>
                    <th className="px-5 py-4">লাইসেন্স নম্বর</th>
                    <th className="px-5 py-4">অভিজ্ঞতা ও ট্রিপ</th>
                    <th className="px-5 py-4">ভেরিফিকেশন স্ট্যাটাস</th>
                    <th className="px-5 py-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {drivers.map((drv) => (
                    <tr key={drv._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-emerald-400 overflow-hidden flex-shrink-0 flex items-center justify-center text-xl shadow-xs">
                            {drv.profileImage || drv.user?.profileImage ? (
                              <img
                                src={getImageUrl(drv.profileImage || drv.user?.profileImage)}
                                alt={drv.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              '👨‍✈️'
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">
                              {drv.fullName || drv.user?.name}
                            </h4>
                            <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                              ⭐ {drv.rating || 4.8} ({drv.totalTrips || 0} ট্রিপ)
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-xs space-y-1">
                        <p className="font-bold text-gray-800">📞 {drv.phone || drv.user?.phone || 'N/A'}</p>
                        <p className="text-gray-500 font-mono">✉️ {drv.email || drv.user?.email}</p>
                      </td>

                      <td className="px-5 py-4 text-xs font-mono font-bold text-emerald-900">
                        {drv.licenseNumber || 'N/A'}
                        <span className="block text-[10px] text-gray-400 font-sans">
                          মেয়াদ: {drv.licenseExpiryDate ? new Date(drv.licenseExpiryDate).toLocaleDateString('bn-BD') : 'অসীম'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-gray-800">
                        <span>{drv.experienceYears || 0} বছর</span>
                        <span className="block text-gray-500 text-[11px]">{drv.totalTrips || 0} টি সফল যাত্রা</span>
                      </td>

                      <td className="px-5 py-4 text-xs">
                        {drv.isVerified || drv.status === 'available' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-full">
                            ✅ ভেরিফাইড (Verified)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 font-extrabold rounded-full animate-pulse">
                            ⏳ অনুমোদন অপেক্ষায় (Pending)
                          </span>
                        )}
                        <span className="block text-[10px] text-gray-400 font-bold mt-1 uppercase">
                          স্ট্যাটাস: {drv.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!drv.isVerified || drv.status === 'pending' || drv.status === 'inactive' ? (
                            <button
                              onClick={() => handleVerifyDriver(drv._id, true, 'available')}
                              disabled={actionDriverId === drv._id}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition"
                            >
                              ✅ অনুমোদন করুন
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerifyDriver(drv._id, false, 'suspended')}
                              disabled={actionDriverId === drv._id}
                              className="px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-xl transition"
                            >
                              ⛔ স্থগিত করুন
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Driver Modal */}
        {addModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <span>➕</span> নতুন ড্রাইভার যোগ করুন
                </h3>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateDriverSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ড্রাইভারের পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    value={newDriver.name}
                    onChange={(e) => setNewDriver((p) => ({ ...p, name: e.target.value }))}
                    placeholder="যেমন: মোঃ সাব্বির হোসেন"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">ইমেইল ঠিকানা *</label>
                    <input
                      type="email"
                      required
                      value={newDriver.email}
                      onChange={(e) => setNewDriver((p) => ({ ...p, email: e.target.value }))}
                      placeholder="driver@example.com"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">ফোন নম্বর *</label>
                    <input
                      type="text"
                      required
                      value={newDriver.phone}
                      onChange={(e) => setNewDriver((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="01700-XXXXXX"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">পাসওয়ার্ড *</label>
                    <input
                      type="password"
                      required
                      value={newDriver.password}
                      onChange={(e) => setNewDriver((p) => ({ ...p, password: e.target.value }))}
                      placeholder="কমপক্ষে ৬ অক্ষর"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">লাইসেন্স নম্বর *</label>
                    <input
                      type="text"
                      required
                      value={newDriver.licenseNumber}
                      onChange={(e) => setNewDriver((p) => ({ ...p, licenseNumber: e.target.value }))}
                      placeholder="DL-DHK-2024-XXXX"
                      className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ড্রাইভিং অভিজ্ঞতা (বছর)</label>
                  <input
                    type="number"
                    min="0"
                    value={newDriver.experienceYears}
                    onChange={(e) => setNewDriver((p) => ({ ...p, experienceYears: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="pt-4 border-t flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow disabled:opacity-50"
                  >
                    {creating ? 'সংরক্ষণ হচ্ছে...' : '💾 ড্রাইভার সংরক্ষণ করুন'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminDrivers;
