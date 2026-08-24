import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PaymentStatusBadge from '../../components/payments/PaymentStatusBadge';
import paymentService from '../../services/payment.service';

const METHOD_LABELS = {
  bkash: 'bKash (বিকাশ)',
  nagad: 'Nagad (নগদ)',
  cash: 'Cash (নগদ টাকা)',
};

const CustomerPaymentDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(location.state?.message || null);
  const [cancelling, setCancelling] = useState(false);

  const fetchPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.getPaymentById(id);
      if (response.success && response.data?.payment) {
        setPayment(response.data.payment);
      } else {
        setError('পেমেন্ট তথ্য পাওয়া যায়নি।');
      }
    } catch (err) {
      setError(err.message || 'পেমেন্ট বিবরণ লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const handleCancelPayment = async () => {
    if (!payment) return;
    if (!window.confirm('আপনি কি নিশ্চিত যে এই পেমেন্টটি বাতিল করতে চান?')) return;

    setCancelling(true);
    try {
      const res = await paymentService.cancelPayment(payment._id);
      if (res.success) {
        setSuccessMsg('পেমেন্ট সফলভাবে বাতিল করা হয়েছে।');
        fetchPayment();
      }
    } catch (err) {
      alert(err.message || 'পেমেন্ট বাতিল করতে সমস্যা হয়েছে।');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/customer/payments"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
          >
            ← আমার পেমেন্ট তালিকায় ফিরে যান
          </Link>
        </div>

        {/* Success Banner */}
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
            <p className="text-sm text-gray-600 mt-4 font-medium">পেমেন্ট বিবরণ লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center my-6 shadow-sm">
            <span className="text-4xl">❌</span>
            <h3 className="text-xl font-bold text-red-700 mt-3">পেমেন্ট পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
            <Link
              to="/customer/payments"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl"
            >
              পেমেন্ট তালিকায় যান
            </Link>
          </div>
        )}

        {/* Content */}
        {!loading && !error && payment && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                  পেমেন্ট আইডি: #{payment.paymentId}
                </span>
                <h1 className="text-2xl font-extrabold text-gray-900 mt-1">পেমেন্ট চালান ও রসিদ</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  তারিখ: {new Date(payment.paymentDate || payment.createdAt).toLocaleString('bn-BD')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <PaymentStatusBadge status={payment.status} />

                {payment.status === 'pending' && (
                  <button
                    onClick={handleCancelPayment}
                    disabled={cancelling}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition disabled:opacity-50"
                  >
                    {cancelling ? 'বাতিল হচ্ছে...' : '🚫 পেমেন্ট বাতিল'}
                  </button>
                )}
              </div>
            </div>

            {/* Payment Summary Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <h4 className="font-bold text-gray-900 border-b pb-1">💳 পেমেন্ট বিবরণ</h4>
                <div>
                  <span className="text-gray-500 block">পেমেন্ট মাধ্যম</span>
                  <strong className="text-gray-900 text-sm">{METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">ট্রানজেকশন আইডি (TrxID)</span>
                  <strong className="text-gray-900 text-sm">{payment.transactionId || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">অনুমোদনের তারিখ</span>
                  <strong className="text-gray-900 text-sm">
                    {payment.confirmedAt ? new Date(payment.confirmedAt).toLocaleString('bn-BD') : 'অপেক্ষমাণ'}
                  </strong>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-2 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-emerald-900 border-b border-emerald-200 pb-1">💰 পরিশোধিত তথ্য</h4>
                  <span className="text-gray-600 block mt-2">মোট মূল্য</span>
                  <span className="text-3xl font-extrabold text-emerald-700">৳{payment.amount?.toLocaleString('bn-BD')}</span>
                </div>

                {payment.refundedAt && (
                  <div className="pt-2 border-t border-emerald-200 text-purple-800">
                    <span className="font-bold block">রিফান্ড তারিখ: {new Date(payment.refundedAt).toLocaleDateString('bn-BD')}</span>
                    <span className="text-gray-600 block">কারণ: {payment.refundReason || 'অ্যাডমিন রিফান্ড'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Associated Booking Info */}
            {payment.booking && (
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-bold text-gray-900">📋 সংলগ্ন বুকিং বিবরণ</h4>
                  <Link
                    to={`/customer/bookings/${payment.booking._id || payment.booking}`}
                    className="text-emerald-700 hover:text-emerald-800 font-bold"
                  >
                    বুকিং পেইজে যান →
                  </Link>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">বুকিং আইডি:</span>
                  <strong className="text-gray-900">#{payment.booking.bookingId || payment.booking}</strong>
                </div>
                {payment.booking.car && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">গাড়ি:</span>
                    <strong className="text-gray-900">{payment.booking.car.name || payment.booking.car}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            {payment.notes && (
              <div className="text-xs bg-gray-50 p-4 rounded-2xl">
                <span className="font-bold text-gray-800 block mb-1">পেমেন্ট সংক্রান্ত নোট:</span>
                <p className="text-gray-600">{payment.notes}</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CustomerPaymentDetails;
