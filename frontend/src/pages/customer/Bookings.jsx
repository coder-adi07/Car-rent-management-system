import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import bookingService from '../../services/booking.service';

const CustomerBookings = () => {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(location.state?.message || null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getAllBookings({ status: statusFilter });
      if (response.success && response.data) {
        setBookings(response.data.bookings || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'বুকিং তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              📋 আমার বুকিং তালিকা (My Bookings)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              আপনার সমস্ত কার রেন্টাল বুকিং অনায়াসে দেখুন এবং স্ট্যাটাস ট্র্যাক করুন।
            </p>
          </div>

          <Link
            to="/cars"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            🚗 নতুন গাড়ি বুক করুন
          </Link>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 mb-6 text-sm flex items-center justify-between">
            <span>✅ {successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold text-emerald-900">✖</button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700">স্ট্যাটাস ফিল্টার:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs bg-white font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">সব বুকিং (All Statuses)</option>
              <option value="pending">অপেক্ষমাণ (Pending)</option>
              <option value="confirmed">নিশ্চিতকৃত (Confirmed)</option>
              <option value="completed">সম্পন্ন (Completed)</option>
              <option value="cancelled">বাতিলকৃত (Cancelled)</option>
              <option value="rejected">প্রত্যাখ্যাত (Rejected)</option>
            </select>
          </div>

          <span className="text-xs text-gray-500 font-semibold">
            মোট পাওয়া গেছে: <strong className="text-emerald-600">{pagination.total}</strong> টি বুকিং
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">আপনার বুকিং তথ্য লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center my-6">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold text-red-800 mt-2">ত্রুটি ঘটেছে</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchBookings}
              className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-6 shadow-sm">
            <span className="text-5xl">📋</span>
            <h3 className="text-xl font-bold text-gray-800 mt-3">এখনও কোনো বুকিং পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-500 mt-1">
              আপনার নির্বাচিত স্ট্যাটাসে কোনো বুকিং নেই অথবা আপনি এখনও কোনো গাড়ি বুকিং করেননি।
            </p>
            <Link
              to="/cars"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow"
            >
              গাড়ির তালিকা দেখুন ও বুকিং করুন
            </Link>
          </div>
        )}

        {/* Booking Items List */}
        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
                    {b.car?.images && b.car.images.length > 0 ? (
                      <img src={b.car.images[0]} alt="Car" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      '🚗'
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        #{b.bookingId}
                      </span>
                      <BookingStatusBadge status={b.status} />
                    </div>

                    <h3 className="text-base font-bold text-gray-900">
                      {b.car?.name || 'গাড়ির তথ্য'} ({b.car?.brand} {b.car?.model})
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                      <span>📅 {new Date(b.startDate).toLocaleDateString('bn-BD')} থেকে {new Date(b.endDate).toLocaleDateString('bn-BD')}</span>
                      <span>⏱️ {b.rentalDays} দিন</span>
                      <span>💰 মোট: <strong className="text-emerald-600 font-bold text-sm">৳{b.totalAmount?.toLocaleString('bn-BD')}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                  <Link
                    to={`/customer/bookings/${b._id}`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow"
                  >
                    বিবরণ দেখুন →
                  </Link>
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

export default CustomerBookings;
