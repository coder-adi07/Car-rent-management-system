import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PaymentStatusBadge from '../../components/payments/PaymentStatusBadge';
import paymentService from '../../services/payment.service';

const METHOD_LABELS = {
  bkash: 'bKash (বিকাশ)',
  nagad: 'Nagad (নগদ)',
  cash: 'Cash (নগদ টাকা)',
};

const AdminPaymentDetails = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Status Change Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Refund Modal
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  const fetchPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.getPaymentById(id);
      if (response.success && response.data?.payment) {
        setPayment(response.data.payment);
        setSelectedStatus(response.data.payment.status);
      } else {
        setError('পেমেন্ট বিবরণ পাওয়া যায়নি।');
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

  const handleUpdateStatus = async () => {
    if (!payment || !selectedStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await paymentService.updatePaymentStatus(payment._id, selectedStatus);
      if (res.success) {
        setSuccessMsg('পেমেন্ট স্ট্যাটাস সফলভাবে পরিবর্তন করা হয়েছে।');
        setStatusModalOpen(false);
        fetchPayment();
      }
    } catch (err) {
      alert(err.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRefund = async () => {
    if (!payment) return;
    setRefunding(true);
    try {
      const res = await paymentService.refundPayment(payment._id, refundReason);
      if (res.success) {
        setSuccessMsg('পেমেন্ট সফলভাবে রিফান্ড করা হয়েছে।');
        setRefundModalOpen(false);
        fetchPayment();
      }
    } catch (err) {
      alert(err.message || 'রিফান্ড প্রসেস করতে সমস্যা হয়েছে।');
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/admin/payments"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
          >
            ← এডমিন পেমেন্ট তালিকায় ফিরে যান
          </Link>
        </div>

        {/* Success Alert */}
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
              to="/admin/payments"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl"
            >
              পেমেন্ট তালিকায় ফিরে যান
            </Link>
          </div>
        )}

        {/* Details Content */}
        {!loading && !error && payment && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                  পেমেন্ট আইডি: #{payment.paymentId}
                </span>
                <h1 className="text-2xl font-extrabold text-gray-900 mt-1">পেমেন্ট চালান বিস্তারিত</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  তৈরির তারিখ: {new Date(payment.paymentDate || payment.createdAt).toLocaleString('bn-BD')}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <PaymentStatusBadge status={payment.status} />

                <button
                  onClick={() => setStatusModalOpen(true)}
                  className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition"
                >
                  🔄 স্ট্যাটাস পরিবর্তন
                </button>

                {payment.status === 'paid' && (
                  <button
                    onClick={() => setRefundModalOpen(true)}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition shadow"
                  >
                    💸 রিফান্ড করুন
                  </button>
                )}
              </div>
            </div>

            {/* Customer & Payment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <h4 className="font-bold text-gray-900 border-b pb-1">👤 গ্রাহকের তথ্য</h4>
                <p className="text-sm font-bold text-gray-900">
                  {payment.customer?.fullName || payment.customer?.user?.name || 'কাস্টমার'}
                </p>
                <p className="text-gray-600">ফোন: {payment.customer?.phone || payment.customer?.user?.phone || 'N/A'}</p>
                <p className="text-gray-600">ইমেইল: {payment.customer?.email || payment.customer?.user?.email || 'N/A'}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                <h4 className="font-bold text-gray-900 border-b pb-1">💳 পেমেন্ট মোড ও ট্রানজেকশন</h4>
                <p className="text-sm font-bold text-gray-900">{METHOD_LABELS[payment.paymentMethod] || payment.paymentMethod}</p>
                <p className="text-gray-600">
                  ট্রানজেকশন আইডি: <strong className="text-gray-900 font-mono">{payment.transactionId || 'N/A'}</strong>
                </p>
                <p className="text-gray-600">
                  অনুমোদনের সময়: {payment.confirmedAt ? new Date(payment.confirmedAt).toLocaleString('bn-BD') : 'অপেক্ষমাণ'}
                </p>
              </div>
            </div>

            {/* Total Amount Card */}
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-600 block">মোট মূল্য (Total Amount)</span>
                <span className="text-3xl font-extrabold text-emerald-700">৳{payment.amount?.toLocaleString('bn-BD')}</span>
              </div>

              {payment.status === 'refunded' && (
                <div className="text-right text-xs text-purple-800">
                  <span className="font-bold block">রিফান্ড তারিখ: {new Date(payment.refundedAt).toLocaleDateString('bn-BD')}</span>
                  <span className="text-gray-600 block">কারণ: {payment.refundReason}</span>
                </div>
              )}
            </div>

            {/* Related Booking Details */}
            {payment.booking && (
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2">
                <div className="flex justify-between items-center border-b pb-2">
                  <h4 className="font-bold text-gray-900">📋 সংলগ্ন বুকিং</h4>
                  <Link
                    to={`/admin/bookings/${payment.booking._id || payment.booking}`}
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

            {payment.notes && (
              <div className="text-xs bg-gray-50 p-4 rounded-2xl">
                <span className="font-bold text-gray-800 block mb-1">পেমেন্ট সংক্রান্ত নোট:</span>
                <p className="text-gray-600">{payment.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Change Status Modal */}
        {statusModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
                🔄 স্ট্যাটাস আপডেট
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">নতুন স্ট্যাটাস</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="pending">অপেক্ষমাণ (pending)</option>
                  <option value="paid">পরিশোধিত (paid)</option>
                  <option value="failed">ব্যর্থ (failed)</option>
                  <option value="refunded">রিফান্ডকৃত (refunded)</option>
                  <option value="cancelled">বাতিলকৃত (cancelled)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setStatusModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
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

        {/* Refund Modal */}
        {refundModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="text-center">
                <span className="text-4xl">💸</span>
                <h3 className="text-lg font-bold text-purple-900 mt-2">পেমেন্ট রিফান্ড করতে চান?</h3>
                <p className="text-xs text-gray-600 mt-1">
                  আপনি <strong>৳{payment?.amount?.toLocaleString('bn-BD')}</strong> রিফান্ড করছেন।
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">রিফান্ডের কারণ</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows="2"
                  placeholder="যেমন: গ্রাহক আবেদন অথবা অতিরিক্ত পেমেন্ট..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setRefundModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleRefund}
                  disabled={refunding}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow disabled:opacity-50"
                >
                  {refunding ? 'রিফান্ড হচ্ছে...' : 'হ্যাঁ, রিফান্ড করুন'}
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

export default AdminPaymentDetails;
