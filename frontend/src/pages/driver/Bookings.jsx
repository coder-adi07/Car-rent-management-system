import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import bookingService from '../../services/booking.service';
import { getImageUrl } from '../../utils/imageUrl';

const DriverBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingService.getAllBookings({
        status: filterStatus || undefined,
        search: search.trim() || undefined,
        limit: 50,
      });
      if (res.success && res.data?.bookings) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      setError(err.message || 'বুকিং তালিকা লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleUpdateTripStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const res = await bookingService.updateBookingStatus(bookingId, newStatus);
      if (res.success) {
        setSuccessMsg(
          newStatus === 'confirmed'
            ? '🚀 যাত্রা শুরু করা হয়েছে! এডমিনের কাছে লাইভ রাইড অ্যালার্ট পাঠানো হয়েছে।'
            : '✅ রাইড সফলভাবে সম্পন্ন হয়েছে!'
        );
        fetchBookings();
      }
    } catch (err) {
      alert(err.message || 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <div>
            <span className="text-xs bg-amber-100 text-amber-800 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              👨‍✈️ ড্রাইভার পোর্টাল (Driver Control)
            </span>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-2">
              🚗 আপনার নির্ধারিত ট্রিপ ও রাইডসমূহ
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              আপনার ড্রাইভের সকল রাইড, পিকআপ ও ড্রপঅফ রুট দেখুন এবং যাত্রা শুরু/সম্পন্ন করুন।
            </p>
          </div>

          <button
            onClick={fetchBookings}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-100 border border-emerald-200 transition self-start sm:self-auto"
          >
            🔄 রিফ্রেশ করুন
          </button>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 text-sm font-semibold flex items-center justify-between shadow-sm">
            <span>✅ {successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold text-gray-500 hover:text-gray-800">
              ✕
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {[
              { label: 'সকল বুকিং', value: '' },
              { label: 'অপেক্ষমাণ (Pending)', value: 'pending' },
              { label: 'অনুমোদিত / চলমান (Confirmed)', value: 'confirmed' },
              { label: 'সম্পন্ন (Completed)', value: 'completed' },
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
              placeholder="বুকিং আইডি দিয়ে খুঁজুন..."
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

        {/* Bookings List */}
        {loading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">নির্ধারিত ট্রিপসমূহ লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 text-red-700 rounded-3xl border border-red-200 text-center font-semibold">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-200 space-y-3">
            <span className="text-5xl">🚗</span>
            <h3 className="text-lg font-bold text-gray-800">কোনো নির্ধারিত ট্রিপ পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              বর্তমানে আপনার নামে কোনো ট্রিপ বা বুকিং নির্ধারিত নেই। অ্যাডমিন নতুন বুকিং বরাদ্দ দিলে সাথে সাথে নোটিফিকেশন পাবেন।
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                      ID: {booking.bookingId || booking._id}
                    </span>
                    <BookingStatusBadge status={booking.status} />
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateTripStatus(booking._id, 'confirmed')}
                        disabled={updatingId === booking._id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition"
                      >
                        🚀 যাত্রা শুরু করুন (Start Trip)
                      </button>
                    )}

                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateTripStatus(booking._id, 'completed')}
                        disabled={updatingId === booking._id}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow transition"
                      >
                        ✅ যাত্রা সম্পন্ন করুন (Complete)
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Car Details */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 border overflow-hidden flex items-center justify-center text-3xl flex-shrink-0">
                      {booking.car?.images && booking.car.images.length > 0 ? (
                        <img
                          src={getImageUrl(booking.car.images[0])}
                          alt={booking.car.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        '🚗'
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                        {booking.car?.carType}
                      </span>
                      <h4 className="font-extrabold text-gray-900 text-sm mt-0.5">
                        {booking.car?.name || 'গাড়ির নাম নেই'}
                      </h4>
                      <p className="text-xs text-gray-500 font-mono">
                        {booking.car?.registrationNumber}
                      </p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-1 text-xs">
                    <span className="text-gray-400 font-bold uppercase tracking-wider block">👤 যাত্রী / কাস্টমার</span>
                    <p className="font-bold text-gray-900 text-sm">
                      {booking.customer?.fullName || booking.customer?.user?.name || 'যাত্রীর নাম পাওয়া যায়নি'}
                    </p>
                    {booking.customer?.phone && (
                      <p className="text-gray-600 font-semibold">
                        📞 ফোন: <a href={`tel:${booking.customer.phone}`} className="text-emerald-700 underline">{booking.customer.phone}</a>
                      </p>
                    )}
                  </div>

                  {/* Route & Dates */}
                  <div className="space-y-1.5 text-xs bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                    <span className="text-emerald-900 font-extrabold uppercase tracking-wider block">📍 পিকআপ ও ড্রপঅফ রুট</span>
                    <p className="text-gray-900 font-semibold">
                      <strong className="text-emerald-700">পিকআপ (Pickup):</strong> {booking.pickupLocation?.address || booking.pickupLocation?.city}
                    </p>
                    <p className="text-gray-900 font-semibold">
                      <strong className="text-rose-700">ড্রপঅফ (Dropoff):</strong> {booking.dropoffLocation?.address || booking.dropoffLocation?.city}
                    </p>
                    <p className="text-gray-600 font-bold pt-1">
                      🗓️ সময়: {new Date(booking.startDate).toLocaleDateString('bn-BD')} হতে {new Date(booking.endDate).toLocaleDateString('bn-BD')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DriverBookings;
