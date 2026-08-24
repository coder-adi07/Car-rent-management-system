import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import bookingService from '../../services/booking.service';
import driverService from '../../services/driver.service';

const AdminBookingDetails = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status Change Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Driver Assign Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [fetchingDrivers, setFetchingDrivers] = useState(false);
  const [assigningDriver, setAssigningDriver] = useState(false);

  const fetchBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getBookingById(id);
      if (response.success && response.data?.booking) {
        setBooking(response.data.booking);
        setSelectedStatus(response.data.booking.status);
        setSelectedDriverId(response.data.booking.driver?._id || '');
      } else {
        setError('বুকিং বিবরণ পাওয়া যায়নি।');
      }
    } catch (err) {
      setError(err.message || 'বুকিং বিবরণ লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!booking || !selectedStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await bookingService.updateBookingStatus(booking._id, selectedStatus, cancellationReason);
      if (res.success) {
        setStatusModalOpen(false);
        fetchBooking();
      }
    } catch (err) {
      alert(err.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenAssignModal = async () => {
    setAssignModalOpen(true);
    setFetchingDrivers(true);
    try {
      const res = await driverService.getAllDrivers({ limit: 100 });
      if (res.success && res.data?.drivers) {
        setDrivers(res.data.drivers.filter((d) => d.status !== 'inactive' && d.status !== 'suspended'));
      }
    } catch (err) {
      alert('ড্রাইভারদের তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setFetchingDrivers(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!booking || !selectedDriverId) return;
    setAssigningDriver(true);
    try {
      const res = await bookingService.assignDriver(booking._id, selectedDriverId);
      if (res.success) {
        setAssignModalOpen(false);
        fetchBooking();
      }
    } catch (err) {
      alert(err.message || 'ড্রাইভার নিয়োগ দেওয়া সম্ভব হয়নি।');
    } finally {
      setAssigningDriver(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/admin/bookings"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
          >
            ← এডমিন বুকিং তালিকায় ফিরে যান
          </Link>
        </div>

        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">বুকিং বিবরণ লোড হচ্ছে...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center my-6 shadow-sm">
            <span className="text-4xl">❌</span>
            <h3 className="text-xl font-bold text-red-700 mt-3">বুকিং পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
            <Link
              to="/admin/bookings"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl"
            >
              বুকিং তালিকায় ফিরে যান
            </Link>
          </div>
        )}

        {!loading && !error && booking && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-8">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                  বুকিং আইডি: #{booking.bookingId}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">সম্পূর্ণ বুকিং বিবরণ</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  তৈরির সময়: {new Date(booking.createdAt).toLocaleString('bn-BD')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <BookingStatusBadge status={booking.status} />
                <button
                  onClick={() => setStatusModalOpen(true)}
                  className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition"
                >
                  🔄 স্ট্যাটাস আপডেট
                </button>
                <button
                  onClick={handleOpenAssignModal}
                  className="px-3.5 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold rounded-xl transition"
                >
                  👨‍✈️ ড্রাইভার নিয়োগ
                </button>

                {booking.status === 'confirmed' && (
                  <Link
                    to={`/admin/rentals/new?bookingId=${booking._id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1"
                  >
                    📄 রেন্টাল চুক্তি তৈরি করুন
                  </Link>
                )}
              </div>
            </div>

            {/* Customer & Car Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Customer Box */}
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                  👤 কাস্টমার বিবরণ
                </h3>
                <div>
                  <span className="text-gray-500 block">পূর্ণ নাম:</span>
                  <strong className="text-gray-900 text-sm">{booking.customer?.fullName || booking.customer?.user?.name || 'গ্রাহক'}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">ফোন নম্বর:</span>
                  <strong className="text-gray-900 text-sm">{booking.customer?.phone || booking.customer?.user?.phone || 'ফোন নেই'}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">ইমেইল:</span>
                  <strong className="text-gray-900 text-sm">{booking.customer?.email || booking.customer?.user?.email || 'ইমেইল নেই'}</strong>
                </div>
              </div>

              {/* Car Box */}
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <h3 className="text-sm font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                  🚗 গাড়ি বিবরণ
                </h3>
                <div>
                  <span className="text-gray-500 block">গাড়ির নাম:</span>
                  <strong className="text-gray-900 text-sm">{booking.car?.name}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">ব্র্যান্ড ও মডেল:</span>
                  <strong className="text-gray-900 text-sm">{booking.car?.brand} {booking.car?.model} ({booking.car?.carType})</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">রেজিস্ট্রেশন নম্বর:</span>
                  <strong className="text-gray-900 text-sm">{booking.car?.registrationNumber}</strong>
                </div>
              </div>
            </div>

            {/* Schedule & Financial Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                <h3 className="text-sm font-bold text-emerald-900 border-b border-emerald-200 pb-2">
                  📅 বুকিং সময়সূচী
                </h3>
                <div className="flex justify-between">
                  <span className="text-gray-600">শুরুর তারিখ:</span>
                  <strong className="text-gray-900">{new Date(booking.startDate).toLocaleDateString('bn-BD')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">সমাপ্তির তারিখ:</span>
                  <strong className="text-gray-900">{new Date(booking.endDate).toLocaleDateString('bn-BD')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">মোট মেয়াদ:</span>
                  <strong className="text-gray-900">{booking.rentalDays} দিন</strong>
                </div>
              </div>

              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2">
                <h3 className="text-sm font-bold text-emerald-900 border-b border-emerald-200 pb-2">
                  💰 আর্থিক হিসেব
                </h3>
                <div className="flex justify-between">
                  <span className="text-gray-600">দৈনিক ভাড়া:</span>
                  <strong className="text-gray-900">৳{booking.dailyRate?.toLocaleString('bn-BD')}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ড্রাইভার রিকোয়েস্ট:</span>
                  <strong className="text-gray-900">{booking.driverRequired ? 'হ্যাঁ (সহ-ড্রাইভার)' : 'না'}</strong>
                </div>
                <div className="flex justify-between pt-2 border-t border-emerald-200 items-center">
                  <span className="text-sm font-bold text-gray-900">সর্বমোট ভাড়া:</span>
                  <span className="text-2xl font-extrabold text-emerald-700">৳{booking.totalAmount?.toLocaleString('bn-BD')}</span>
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-1">📍 পিকআপ স্থান</h4>
                <p className="text-sm font-semibold text-gray-800">{booking.pickupLocation?.address}</p>
                <p className="text-gray-500">{booking.pickupLocation?.city}, {booking.pickupLocation?.district}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-1">🚩 ড্রপঅফ স্থান</h4>
                <p className="text-sm font-semibold text-gray-800">{booking.dropoffLocation?.address}</p>
                <p className="text-gray-500">{booking.dropoffLocation?.city}, {booking.dropoffLocation?.district}</p>
              </div>
            </div>

            {/* Assigned Driver Box */}
            <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 text-xs">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-blue-900">👨‍✈️ নিয়োজিত ড্রাইভার</h3>
                <button
                  onClick={handleOpenAssignModal}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                >
                  {booking.driver ? 'পরিবর্তন করুন' : '+ ড্রাইভার নিয়োগ'}
                </button>
              </div>

              {booking.driver ? (
                <div>
                  <p className="text-sm font-bold text-gray-900">{booking.driver.fullName || booking.driver.user?.name}</p>
                  <p className="text-gray-600">ফোন: {booking.driver.phone || booking.driver.user?.phone}</p>
                  <p className="text-gray-600">লাইসেন্স: {booking.driver.licenseNumber}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">এখনও কোনো ড্রাইভার নিযুক্ত করা হয়নি।</p>
              )}
            </div>

            {/* Special Request / Cancellation reason */}
            {booking.specialRequest && (
              <div className="text-xs bg-gray-50 p-4 rounded-2xl">
                <span className="font-bold text-gray-800 block mb-1">বিশেষ নোট / অনুরোধ:</span>
                <p className="text-gray-600">{booking.specialRequest}</p>
              </div>
            )}

            {booking.cancellationReason && (
              <div className="text-xs bg-red-50 p-4 rounded-2xl border border-red-100 text-red-800">
                <span className="font-bold block mb-1">বাতিলের নোট:</span>
                <p>{booking.cancellationReason}</p>
              </div>
            )}
          </div>
        )}

        {/* Change Status Modal */}
        {statusModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
                🔄 বুকিং স্ট্যাটাস পরিবর্তন
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">নতুন স্ট্যাটাস</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pending">অপেক্ষমাণ (pending)</option>
                  <option value="confirmed">নিশ্চিতকৃত (confirmed)</option>
                  <option value="completed">সম্পন্ন (completed)</option>
                  <option value="rejected">প্রত্যাখ্যাত (rejected)</option>
                  <option value="cancelled">বাতিলকৃত (cancelled)</option>
                </select>
              </div>

              {['rejected', 'cancelled'].includes(selectedStatus) && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">বাতিলের কারণ</label>
                  <textarea
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    rows="2"
                    placeholder="যেমন: গাড়ি বা ড্রাইভার উপলব্ধ নেই..."
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs"
                  ></textarea>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow disabled:opacity-50"
                >
                  {updatingStatus ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Driver Modal */}
        {assignModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
                👨‍✈️ ড্রাইভার নিয়োগ করুন
              </h3>

              {fetchingDrivers ? (
                <div className="py-8 text-center text-xs text-gray-500">ড্রাইভার তালিকা লোড হচ্ছে...</div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ড্রাইভার নির্বাচন করুন</label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- ড্রাইভার নির্বাচন করুন --</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.fullName} ({d.phone}) - {d.status}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleAssignDriver}
                  disabled={assigningDriver || !selectedDriverId}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow disabled:opacity-50"
                >
                  {assigningDriver ? 'নিয়োগ হচ্ছে...' : 'ড্রাইভার বরাদ্দ করুন'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminBookingDetails;
