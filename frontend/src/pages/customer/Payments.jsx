import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import PaymentCard from '../../components/payments/PaymentCard';
import paymentService from '../../services/payment.service';

const CustomerPayments = () => {
  const location = useLocation();
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(location.state?.message || null);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              💳 আমার পেমেন্ট ইতিহাস (My Payments)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              আপনার সমস্ত পরিশোধিত ও অপেক্ষমাণ পেমেন্টের তথ্য এবং ট্রানজেকশন আইডি ট্র্যাক করুন।
            </p>
          </div>

          <Link
            to="/customer/bookings"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            📋 আমার বুকিং দেখুন
          </Link>
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
              placeholder="পেমেন্ট বা TrxID সার্চ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 min-w-[200px]"
            />
          </div>

          <span className="text-xs text-gray-500 font-semibold self-end sm:self-auto">
            মোট পাওয়া গেছে: <strong className="text-emerald-600">{pagination.total}</strong> টি পেমেন্ট
          </span>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">পেমেন্ট ইতিহাস লোড হচ্ছে...</p>
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
            <p className="text-sm text-gray-500 mt-1">
              আপনার ফিল্টার অনুযায়ী কোনো পেমেন্ট রেকর্ড নেই।
            </p>
            <Link
              to="/customer/bookings"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow"
            >
              আমার বুকিং দেখুন
            </Link>
          </div>
        )}

        {/* Payment Items List */}
        {!loading && !error && payments.length > 0 && (
          <div className="space-y-4">
            {payments.map((p) => (
              <PaymentCard key={p._id} payment={p} isAdmin={false} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CustomerPayments;
