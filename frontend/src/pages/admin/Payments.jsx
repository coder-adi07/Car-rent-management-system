import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PaymentStatusBadge from '../../components/payments/PaymentStatusBadge';
import paymentService from '../../services/payment.service';

const METHOD_LABELS = {
  bkash: 'bKash (বিকাশ)',
  nagad: 'Nagad (নগদ)',
  cash: 'Cash (নগদ টাকা)',
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Status Change Modal
  const [statusModalPayment, setStatusModalPayment] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Refund Modal
  const [refundModalPayment, setRefundModalPayment] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await paymentService.getAllPayments({
        status: statusFilter,
        search: searchQuery,
        page: pagination.page,
      });
      if (response.success && response.data) {
        setPayments(response.data.payments || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'পেমেন্ট তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, searchQuery, pagination.page]);

  const handleUpdateStatus = async () => {
    if (!statusModalPayment || !selectedStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await paymentService.updatePaymentStatus(statusModalPayment._id, selectedStatus);
      if (res.success) {
        setSuccessMsg(`পেমেন্ট (${statusModalPayment.paymentId}) এর স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।`);
        setStatusModalPayment(null);
        fetchPayments();
      }
    } catch (err) {
      alert(err.message || 'স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRefund = async () => {
    if (!refundModalPayment) return;
    setRefunding(true);
    try {
      const res = await paymentService.refundPayment(refundModalPayment._id, refundReason);
      if (res.success) {
        setSuccessMsg(`পেমেন্ট (${refundModalPayment.paymentId}) সফলভাবে রিফান্ড করা হয়েছে।`);
        setRefundModalPayment(null);
        setRefundReason('');
        fetchPayments();
      }
    } catch (err) {
      alert(err.message || 'পেমেন্ট রিফান্ড করতে সমস্যা হয়েছে।');
    } finally {
      setRefunding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              💳 এডমিন পেমেন্ট বুক (Payment Management)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              গ্রাহকদের সমস্ত পেমেন্ট ট্র্যাক করুন, স্ট্যাটাস পরিবর্তন করুন এবং প্রয়োজনে রিফান্ড প্রসেস করুন।
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 mb-6 text-sm flex items-center justify-between">
            <span>✅ {successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold">✖</button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">স্ট্যাটাস:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs bg-white font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">সব পেমেন্ট (All)</option>
                <option value="pending">অপেক্ষমাণ (Pending)</option>
                <option value="paid">পরিশোধিত (Paid)</option>
                <option value="failed">ব্যর্থ (Failed)</option>
                <option value="refunded">রিফান্ডকৃত (Refunded)</option>
                <option value="cancelled">বাতিলকৃত (Cancelled)</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="পেমেন্ট আইডি বা TrxID সার্চ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 min-w-[220px]"
            />
          </div>

          <span className="text-xs text-gray-500 font-semibold self-end sm:self-auto">
            মোট পেমেন্ট: <strong className="text-emerald-600">{pagination.total}</strong> টি
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">পেমেন্ট তালিকা লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center my-6">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold text-red-800 mt-2">ত্রুটি ঘটেছে</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchPayments}
              className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && payments.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-6 shadow-sm">
            <span className="text-5xl">💳</span>
            <h3 className="text-xl font-bold text-gray-800 mt-3">কোনো পেমেন্ট তথ্য পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-500 mt-1">আপনার ফিল্টার অনুযায়ী কোনো পেমেন্ট রেকর্ড নেই।</p>
          </div>
        )}

        {/* Payments Table */}
        {!loading && !error && payments.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">পেমেন্ট আইডি</th>
                    <th className="p-4">বুকিং আইডি</th>
                    <th className="p-4">গ্রাহক</th>
                    <th className="p-4">পদ্ধতি & TrxID</th>
                    <th className="p-4">পরিমাণ</th>
                    <th className="p-4">স্ট্যাটাস</th>
                    <th className="p-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/80 transition">
                      <td className="p-4 font-bold text-emerald-800">
                        <Link to={`/admin/payments/${p._id}`} className="hover:underline">
                          #{p.paymentId}
                        </Link>
                      </td>
                      <td className="p-4 font-medium text-gray-900">
                        {p.booking?.bookingId ? (
                          <Link to={`/admin/bookings/${p.booking._id}`} className="hover:underline text-emerald-700 font-semibold">
                            #{p.booking.bookingId}
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="p-4 font-medium text-gray-900">
                        {p.customer?.fullName || p.customer?.user?.name || 'গ্রাহক'}
                        <span className="block text-[11px] text-gray-500 font-normal">
                          {p.customer?.phone || p.customer?.user?.phone}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-gray-800">{METHOD_LABELS[p.paymentMethod] || p.paymentMethod}</span>
                        {p.transactionId && (
                          <span className="block text-[11px] text-gray-500 font-mono">TrxID: {p.transactionId}</span>
                        )}
                      </td>
                      <td className="p-4 font-extrabold text-emerald-700 text-sm">
                        ৳{p.amount?.toLocaleString('bn-BD')}
                      </td>
                      <td className="p-4">
                        <PaymentStatusBadge status={p.status} />
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setStatusModalPayment(p);
                            setSelectedStatus(p.status);
                          }}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg transition"
                          title="স্ট্যাটাস আপডেট"
                        >
                          🔄 আপডেট
                        </button>
                        {p.status === 'paid' && (
                          <button
                            onClick={() => setRefundModalPayment(p)}
                            className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold rounded-lg transition"
                            title="রিফান্ড প্রসেস"
                          >
                            💸 রিফান্ড
                          </button>
                        )}
                        <Link
                          to={`/admin/payments/${p._id}`}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow"
                        >
                          ভিউ →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {statusModalPayment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
                🔄 পেমেন্ট স্ট্যাটাস পরিবর্তন (#{statusModalPayment.paymentId})
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">নতুন স্ট্যাটাস নির্বাচন করুন</label>
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
                  onClick={() => setStatusModalPayment(null)}
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

        {/* Refund Modal */}
        {refundModalPayment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <div className="text-center">
                <span className="text-4xl">💸</span>
                <h3 className="text-lg font-bold text-purple-900 mt-2">পেমেন্ট রিফান্ড করতে নিশ্চিত?</h3>
                <p className="text-xs text-gray-600 mt-1">
                  আপনি পেমেন্ট <strong>#{refundModalPayment.paymentId}</strong> (৳{refundModalPayment.amount?.toLocaleString('bn-BD')}) রিফান্ড করতে যাচ্ছেন।
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">রিফান্ডের কারণ</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows="2"
                  placeholder="যেমন: গ্রাহক কর্তৃক রেন্টাল বাতিল বা অতিরিক্ত পেমেন্ট..."
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setRefundModalPayment(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  ফিরে যান
                </button>
                <button
                  onClick={handleRefund}
                  disabled={refunding}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow disabled:opacity-50"
                >
                  {refunding ? 'রিফান্ড প্রসেস হচ্ছে...' : 'হ্যাঁ, রিফান্ড করুন'}
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

export default AdminPayments;
