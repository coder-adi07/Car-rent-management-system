import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import bookingService from '../../services/booking.service';
import rentalService from '../../services/rental.service';

const CreateRental = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get('bookingId');

  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [bookingError, setBookingError] = useState(null);

  // Form fields
  const [startMileage, setStartMileage] = useState(45000);
  const [startFuelLevel, setStartFuelLevel] = useState(100);
  const [notes, setNotes] = useState('গাড়ি হস্তান্তরিত করা হয়েছে এবং রেন্টাল চুক্তি শুরু হয়েছে।');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!bookingIdParam) {
      setBookingError('রেন্টাল চুক্তি তৈরির জন্য একটি নির্দিষ্ট বুকিং নির্বাচন করুন।');
      setLoadingBooking(false);
      return;
    }

    const fetchBooking = async () => {
      setLoadingBooking(true);
      setBookingError(null);
      try {
        const response = await bookingService.getBookingById(bookingIdParam);
        if (response.success && response.data?.booking) {
          const b = response.data.booking;
          if (b.status !== 'confirmed') {
            setBookingError('শুধুমাত্র নিশ্চিতকৃত (confirmed) বুকিংয়ের জন্য রেন্টাল চুক্তি তৈরি করা সম্ভব।');
          } else {
            setBooking(b);
            if (b.car?.currentMileage) {
              setStartMileage(b.car.currentMileage);
            }
          }
        } else {
          setBookingError('বুকিং বিবরণ পাওয়া যায়নি।');
        }
      } catch (err) {
        setBookingError(err.message || 'বুকিং বিবরণ লোড করতে সমস্যা হয়েছে।');
      } finally {
        setLoadingBooking(false);
      }
    };

    fetchBooking();
  }, [bookingIdParam]);

  const handleSubmitRental = async (e) => {
    e.preventDefault();
    if (!booking) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        bookingId: booking._id,
        startMileage: Number(startMileage),
        startFuelLevel: Number(startFuelLevel),
        notes: notes.trim() || null,
      };

      const res = await rentalService.createRental(payload);
      if (res.success && res.data?.rental) {
        navigate(`/admin/rentals/${res.data.rental._id}`, {
          state: { message: 'রেন্টাল চুক্তি সফলভাবে তৈরি করা হয়েছে এবং গাড়ির স্ট্যাটাস (Rented) এ পরিবর্তন হয়েছে!' },
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'রেন্টাল চুক্তি তৈরি করতে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/admin/bookings"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
          >
            ← এডমিন বুকিং তালিকায় ফিরে যান
          </Link>
        </div>

        {/* Loading */}
        {loadingBooking && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">বুকিং বিবরণ যাচাই করা হচ্ছে...</p>
          </div>
        )}

        {/* Error */}
        {!loadingBooking && bookingError && (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center my-6 shadow-sm">
            <span className="text-4xl">⚠️</span>
            <h3 className="text-lg font-bold text-red-700 mt-3">রেন্টাল চুক্তি তৈরি করা সম্ভব নয়</h3>
            <p className="text-sm text-gray-600 mt-1">{bookingError}</p>
            <Link
              to="/admin/bookings"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl"
            >
              বুকিং তালিকায় ফিরে যান
            </Link>
          </div>
        )}

        {/* Create Form */}
        {!loadingBooking && !bookingError && booking && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded">
                বুকিং আইডি: #{booking.bookingId}
              </span>
              <h1 className="text-2xl font-extrabold text-gray-900 mt-2">নতুন রেন্টাল চুক্তিপত্র ইস্যু করুন</h1>
              <p className="text-xs text-gray-500 mt-1">
                গাড়ি হস্তান্তরের সময় বর্তমান মাইলপেজ ও ফুয়েল লেভেল নথিভুক্ত করুন।
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs font-semibold flex items-center justify-between">
                <span>⚠️ {errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="font-bold">✖</button>
              </div>
            )}

            {/* Booking Summary Box */}
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-blue-900 border-b border-blue-200 pb-2">
                📋 বুকিং বিস্তারিত
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">গাড়ির নাম:</span>
                  <strong className="text-gray-900 text-sm">{booking.car?.name}</strong> ({booking.car?.brand} {booking.car?.registrationNumber})
                </div>
                <div>
                  <span className="text-gray-500 block">গ্রাহক:</span>
                  <strong className="text-gray-900">{booking.customer?.fullName || booking.customer?.user?.name || 'গ্রাহক'}</strong> ({booking.customer?.phone})
                </div>
                <div>
                  <span className="text-gray-500 block">সময়কাল:</span>
                  <strong className="text-gray-900">{new Date(booking.startDate).toLocaleDateString('bn-BD')} - {new Date(booking.endDate).toLocaleDateString('bn-BD')}</strong> ({booking.rentalDays} দিন)
                </div>
                <div>
                  <span className="text-gray-500 block">ড্রাইভার:</span>
                  <strong className="text-gray-900">{booking.driver?.fullName || 'সহ-ড্রাইভার ছাড়া'}</strong>
                </div>
              </div>
              <div className="pt-2 border-t border-blue-200 flex justify-between items-center text-xs">
                <span className="font-bold text-gray-900">মোট চুক্তি মূল্য:</span>
                <span className="text-xl font-extrabold text-blue-700">৳{booking.totalAmount?.toLocaleString('bn-BD')}</span>
              </div>
            </div>

            {/* Contract Form */}
            <form onSubmit={handleSubmitRental} className="space-y-5 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Start Mileage */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    শুরুর মাইলপেজ (Start Mileage in km) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={startMileage}
                    onChange={(e) => setStartMileage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Start Fuel Level */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    শুরুর ফুয়েল লেভেল (% Fuel Level) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={startFuelLevel}
                    onChange={(e) => setStartFuelLevel(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  রেন্টাল নোট / হ্যান্ডওভার রিমার্কস
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  placeholder="যেমন: হ্যান্ডওভার সম্পন্ন, বডি চেক করা হয়েছে..."
                  className="w-full p-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl transition shadow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>রেন্টাল চুক্তি তৈরি হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>📄 চুক্তিপত্র অনুমোদন করুন ও গাড়ি হ্যান্ডওভার করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CreateRental;
