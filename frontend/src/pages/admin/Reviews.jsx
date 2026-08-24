import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ReviewCard from '../../components/reviews/ReviewCard';
import reviewService from '../../services/review.service';
import { useAuth } from '../../context/AuthContext';

const AdminReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.getAllReviews({
        status: statusFilter,
        page: pagination.page,
      });
      if (response.success && response.data) {
        setReviews(response.data.reviews || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'রিভিউ তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, pagination.page]);

  const handleToggleStatus = async (rev) => {
    const nextStatus = rev.status === 'published' ? 'hidden' : 'published';
    try {
      const res = await reviewService.updateReviewStatus(rev._id, nextStatus);
      if (res.success) {
        setSuccessMsg(`রিভিউ স্ট্যাটাস সফলভাবে '${nextStatus === 'published' ? 'প্রকাশিত' : 'গোপন'}' করা হয়েছে।`);
        fetchReviews();
      }
    } catch (err) {
      alert(err.message || 'স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে।');
    }
  };

  const handleDeleteReview = async (rev) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই রিভিউটি স্থায়ীভাবে মুছে ফেলতে চান?')) return;
    try {
      const res = await reviewService.deleteReview(rev._id);
      if (res.success) {
        setSuccessMsg('রিভিউটি সফলভাবে মুছে ফেলা হয়েছে।');
        fetchReviews();
      }
    } catch (err) {
      alert(err.message || 'রিভিউ মুছতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              ⭐ এডমিন রিভিউ মডারেশন (Review Management)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              গ্রাহকদের সমস্ত রিভিউ তদারকি করুন, অনুমোদন বা গোপন করুন এবং অনুপযুক্ত রিভিউ মুছে ফেলুন।
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

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700">স্ট্যাটাস ফিল্টার:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs bg-white font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">সব রিভিউ (All Reviews)</option>
              <option value="published">প্রকাশিত (Published)</option>
              <option value="hidden">গোপন (Hidden)</option>
            </select>
          </div>

          <span className="text-xs text-gray-500 font-semibold self-end sm:self-auto">
            মোট রিভিউ: <strong className="text-emerald-600">{pagination.total}</strong> টি
          </span>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">রিভিউ তালিকা লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center my-6">
            <span className="text-3xl">⚠️</span>
            <h3 className="text-lg font-bold text-red-800 mt-2">ত্রুটি ঘটেছে</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button
              onClick={fetchReviews}
              className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition"
            >
              পুনরায় চেষ্টা করুন
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && reviews.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-6 shadow-sm">
            <span className="text-5xl">⭐</span>
            <h3 className="text-xl font-bold text-gray-800 mt-3">কোনো রিভিউ পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-500 mt-1">আপনার ফিল্টার অনুযায়ী কোনো রিভিউ রেকর্ড নেই।</p>
          </div>
        )}

        {/* Reviews Grid */}
        {!loading && !error && reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <ReviewCard
                key={r._id}
                review={r}
                currentUserId={user?._id}
                isAdmin={true}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminReviews;
