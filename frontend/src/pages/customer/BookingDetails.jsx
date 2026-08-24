import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BookingStatusBadge from '../../components/bookings/BookingStatusBadge';
import DriverCard from '../../components/drivers/DriverCard';
import bookingService from '../../services/booking.service';

const CustomerBookingDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(location.state?.message || null);

  // Cancel Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bookingService.getBookingById(id);
      if (response.success && response.data?.booking) {
        setBooking(response.data.booking);
      } else {
        setError('বুকিং তথ্য পাওয়া যায়নি।');
      }
    } catch (err) {
      setError(err.message || 'বুকিংয়ের বিস্তারিত লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const handleCancelBooking = async () => {
    if (!booking) return;
    setCancelling(true);
    try {
      const res = await bookingService.cancelBooking(booking._id, cancellationReason);
      if (res.success) {
        setSuccessMsg('বুকিংটি সফলভাবে বাতিল করা হয়েছে।');
        setCancelModalOpen(false);
        fetchBooking();
      }
    } catch (err) {
      alert(err.message || 'বুকিং বাতিল করতে সমস্যা হয়েছে।');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/customer/bookings"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
          >
            ← আমার বুকিং তালিকায় ফিরে যান
          </Link>
        </div>

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 mb-6 text-sm flex items-center justify-between">
            <span>✅ {successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold">✖</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">বুকিং বিবরণ লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center my-6 shadow-sm">
            <span className="text-4xl">❌</span>
            <h3 className="text-xl font-bold text-red-700 mt-3">বুকিং পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
            <Link
              to="/customer/bookings"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition"
            >
              বুকিং তালিকায় ফিরে যান
            </Link>
          </div>
        )}

        {/* Booking Details Content */}
        {!loading && !error && booking && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
            {/* Header Title & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                  বুকিং আইডি: #{booking.bookingId}
                </span>
                <h1 className="text-2xl font-extrabold text-gray-900 mt-1">বুকিং রিকোয়েস্ট বিস্তারিত</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  তৈরির তারিখ: {new Date(booking.createdAt).toLocaleString('bn-BD')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <BookingStatusBadge status={booking.status} />

                {/* Make Payment CTA if eligible */}
                {['pending', 'confirmed'].includes(booking.status) && (
                  <Link
                    to={`/customer/payments/new?bookingId=${booking._id}`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1"
                  >
                    💳 পেমেন্ট করুন
                  </Link>
                )}

                {/* Write Review CTA if completed */}
                {booking.status === 'completed' && (
                  <Link
                    to={`/customer/reviews/new?bookingId=${booking._id}`}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition shadow flex items-center gap-1"
                  >
                    ⭐ রিভিউ প্রদান করুন
                  </Link>
                )}

                {/* Cancel Button if eligible */}
                {['pending', 'confirmed'].includes(booking.status) && (
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition"
                  >
                    🚫 বুকিং বাতিল করুন
                  </button>
                )}
              </div>
            </div>

            {/* Car Details Summary */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center text-3xl flex-shrink-0">
                {booking.car?.images && booking.car.images.length > 0 ? (
                  <img src={booking.car.images[0]} alt={booking.car.name} className="w-full h-full object-cover" />
                ) : (
                  '🚗'
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase">{booking.car?.carType}</span>
                <h3 className="text-base font-bold text-gray-900">{booking.car?.name}</h3>
                <p className="text-xs text-gray-600">
                  {booking.car?.brand} {booking.car?.model} ({booking.car?.registrationNumber})
                </p>
              </div>
            </div>

            {/* Schedule & Pricing Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <h4 className="font-bold text-gray-900 border-b pb-1">📅 সময়সূচী</h4>
                <div>
                  <span className="text-gray-500 block">শুরুর তারিখ</span>
                  <strong className="text-gray-900 text-sm">{new Date(booking.startDate).toLocaleDateString('bn-BD')}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">সমাপ্তির তারিখ</span>
                  <strong className="text-gray-900 text-sm">{new Date(booking.endDate).toLocaleDateString('bn-BD')}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">মোট দিন</span>
                  <strong className="text-gray-900 text-sm">{booking.rentalDays} দিন</strong>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                <h4 className="font-bold text-gray-900 border-b pb-1">💰 পেমেন্ট সামারি</h4>
                <div>
                  <span className="text-gray-500 block">দৈনিক ভাড়ার হার</span>
                  <strong className="text-gray-900 text-sm">৳{booking.dailyRate?.toLocaleString('bn-BD')}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">ড্রাইভার অপশন</span>
                  <strong className="text-gray-900 text-sm">
                    {booking.driverRequired ? 'সহ-ড্রাইভারসহ (With Driver)' : 'ড্রাইভার ছাড়া (Self Drive)'}
                  </strong>
                </div>
                <div className="pt-1 border-t border-gray-200">
                  <span className="text-gray-500 block">মোট মূল্য</span>
                  <strong className="text-emerald-600 text-xl font-extrabold">৳{booking.totalAmount?.toLocaleString('bn-BD')}</strong>
                </div>
              </div>
            </div>

            {/* Locations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <h4 className="font-bold text-emerald-800 mb-1">📍 পিকআপ লোকেশন</h4>
                <p className="text-sm font-semibold text-gray-900">{booking.pickupLocation?.address || 'ঠিকানা'}</p>
                <p className="text-gray-600">{booking.pickupLocation?.city}, {booking.pickupLocation?.district}</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <h4 className="font-bold text-emerald-800 mb-1">🚩 ড্রপঅফ লোকেশন</h4>
                <p className="text-sm font-semibold text-gray-900">{booking.dropoffLocation?.address || 'ঠিকানা'}</p>
                <p className="text-gray-600">{booking.dropoffLocation?.city}, {booking.dropoffLocation?.district}</p>
              </div>
            </div>

            {/* Driver Profile Card */}
            <div className="pt-2">
              <DriverCard
                driver={booking.driver || booking.car?.assignedDriver}
                title="👨‍✈️ আপনার ট্রিপের জন্য নিযুক্ত ড্রাইভারের বিবরণ"
              />
            </div>

            {/* Notes & Cancellation reason */}
            {booking.specialRequest && (
              <div className="text-xs bg-gray-50 p-3 rounded-xl">
                <span className="font-bold text-gray-700 block mb-1">বিশেষ অনুরোধ:</span>
                <p className="text-gray-600">{booking.specialRequest}</p>
              </div>
            )}

            {booking.cancellationReason && (
              <div className="text-xs bg-red-50 p-3 rounded-xl border border-red-100 text-red-800">
                <span className="font-bold block mb-1">বাতিলকরণের কারণ:</span>
                <p>{booking.cancellationReason}</p>
              </div>
            )}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        {cancelModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="text-center">
                <span className="text-4xl">⚠️</span>
                <h3 className="text-lg font-bold text-red-700 mt-2">বুকিং বাতিল করতে নিশ্চিত?</h3>
                <p className="text-xs text-gray-600 mt-1">
                  আপনি বুকিং <strong>#{booking?.bookingId}</strong> বাতিল করতে যাচ্ছেন।
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">বাতিলের কারণ (ঐচ্ছিক)</label>
                <textarea
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows="2"
                  placeholder="যেমন: পরিকল্পনার পরিবর্তন..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  ফিরে যান
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow disabled:opacity-50"
                >
                  {cancelling ? 'বাতিল হচ্ছে...' : 'হ্যাঁ, বুকিং বাতিল করুন'}
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

export default CustomerBookingDetails;
