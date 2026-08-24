import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import bookingService from '../../services/booking.service';
import paymentService from '../../services/payment.service';

const CreatePayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get('bookingId');

  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [bookingError, setBookingError] = useState(null);

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!bookingIdParam) {
      setBookingError('পেমেন্ট করার জন্য বুকিং সিলেক্ট করুন।');
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
          if (['cancelled', 'rejected'].includes(b.status)) {
            setBookingError('বাতিলকৃত অথবা প্রত্যাখ্যাত বুকিংয়ের জন্য পেমেন্ট গ্রহণ করা সম্ভব নয়।');
          } else {
            setBooking(b);
          }
        } else {
          setBookingError('বুকিং তথ্য পাওয়া যায়নি।');
        }
      } catch (err) {
        setBookingError(err.message || 'বুকিং বিবরণ লোড করতে সমস্যা হয়েছে।');
      } finally {
        setLoadingBooking(false);
      }
    };

    fetchBooking();
  }, [bookingIdParam]);

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!booking) return;

    if (paymentMethod !== 'cash' && !transactionId.trim()) {
      setErrorMsg('bKash অথবা Nagad পেমেন্টের ক্ষেত্রে ট্রানজেকশন আইডি প্রদান করা বাধ্যতামূলক।');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        bookingId: booking._id,
        amount: booking.totalAmount,
        paymentMethod,
        transactionId: transactionId.trim() || null,
        notes: notes.trim() || null,
      };

      const res = await paymentService.createPayment(payload);
      if (res.success && res.data?.payment) {
        navigate(`/customer/payments/${res.data.payment._id}`, {
          state: { message: 'পেমেন্ট সফলভাবে সম্পন্ন হয়েছে!' },
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে।');
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
            to="/customer/bookings"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
          >
            ← বুকিং তালিকায় ফিরে যান
          </Link>
        </div>

        {/* Loading State */}
        {loadingBooking && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">বুকিং তথ্য লোড করা হচ্ছে...</p>
          </div>
        )}

        {/* Error State */}
        {!loadingBooking && bookingError && (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center my-6 shadow-sm">
            <span className="text-4xl">⚠️</span>
            <h3 className="text-lg font-bold text-red-700 mt-3">পেমেন্ট সম্ভব নয়</h3>
            <p className="text-sm text-gray-600 mt-1">{bookingError}</p>
            <Link
              to="/customer/bookings"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl"
            >
              আমার বুকিং তালিকায় যান
            </Link>
          </div>
        )}

        {/* Payment Form & Booking Summary */}
        {!loadingBooking && !bookingError && booking && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                বুকিং আইডি: #{booking.bookingId}
              </span>
              <h1 className="text-2xl font-extrabold text-gray-900 mt-2">পেমেন্ট করুন (Make Payment)</h1>
              <p className="text-xs text-gray-500 mt-1">
                পছন্দের পেমেন্ট মাধ্যম নির্বাচন করুন এবং ট্রানজেকশন তথ্য প্রদান করুন।
              </p>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs font-semibold flex items-center justify-between">
                <span>⚠️ {errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="font-bold">✖</button>
              </div>
            )}

            {/* Booking Summary Box */}
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-emerald-900 border-b border-emerald-200 pb-2">
                📋 বুকিং সংক্রান্ত তথ্য
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">গাড়ি:</span>
                  <strong className="text-gray-900 text-sm">{booking.car?.name}</strong> ({booking.car?.brand})
                </div>
                <div>
                  <span className="text-gray-500 block">মেয়াদ:</span>
                  <strong className="text-gray-900">{new Date(booking.startDate).toLocaleDateString('bn-BD')} - {new Date(booking.endDate).toLocaleDateString('bn-BD')}</strong> ({booking.rentalDays} দিন)
                </div>
              </div>
              <div className="pt-2 border-t border-emerald-200 flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">মোট দেওয় ভাড়ার পরিমাণ:</span>
                <span className="text-2xl font-extrabold text-emerald-700">৳{booking.totalAmount?.toLocaleString('bn-BD')}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitPayment} className="space-y-5 pt-2">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  পেমেন্ট পদ্ধতি নির্বাচন করুন (Payment Method) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'bkash', label: 'bKash (বিকাশ)', icon: '📱' },
                    { id: 'nagad', label: 'Nagad (নগদ)', icon: '💸' },
                    { id: 'cash', label: 'Cash (নগদ)', icon: '💵' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition flex flex-col items-center gap-1 ${
                        paymentMethod === m.id
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300'
                      }`}
                    >
                      <span className="text-xl">{m.icon}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Instructions for bKash/Nagad */}
              {paymentMethod !== 'cash' && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                  <p className="font-bold">💡 পেমেন্ট নির্দেশিকা:</p>
                  <p>আমাদের মার্চেন্ট নম্বর <strong className="text-emerald-700 font-extrabold">01700-000000</strong> এ ৳{booking.totalAmount?.toLocaleString('bn-BD')} Send Money / Payment করুন এবং প্রাপ্ত TrxID নিচে লিখুন।</p>
                </div>
              )}

              {/* Transaction ID */}
              {paymentMethod !== 'cash' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    ট্রানজেকশন আইডি (TrxID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="যেমন: 9A8B7C6D5E"
                    className="w-full p-3 border border-gray-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 uppercase"
                  />
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  নোট / মন্তব্য (ঐচ্ছিক)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="2"
                  placeholder="পেমেন্ট সংক্রান্ত কোনো মন্তব্য থাকলে লিখুন..."
                  className="w-full p-3 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition shadow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>পেমেন্ট প্রসেস হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>💳 ৳{booking.totalAmount?.toLocaleString('bn-BD')} পেমেন্ট নিশ্চিত করুন</span>
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

export default CreatePayment;
