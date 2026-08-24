import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ReviewCard from '../../components/reviews/ReviewCard';
import RatingInput from '../../components/reviews/RatingInput';
import reviewService from '../../services/review.service';
import { useAuth } from '../../context/AuthContext';

const CustomerReviews = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(location.state?.message || null);

  // Edit Modal State
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.getAllReviews({ page: pagination.page });
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
  }, [pagination.page]);

  const handleOpenEdit = (rev) => {
    setEditingReview(rev);
    setEditRating(rev.rating);
    setEditComment(rev.comment || '');
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;
    setUpdating(true);
    try {
      const res = await reviewService.updateReview(editingReview._id, {
        rating: Number(editRating),
        comment: editComment.trim() || null,
      });
      if (res.success) {
        setSuccessMsg('আপনার রিভিউটি সফলভাবে আপডেট করা হয়েছে।');
        setEditingReview(null);
        fetchReviews();
      }
    } catch (err) {
      alert(err.message || 'রিভিউ আপডেট করতে সমস্যা হয়েছে।');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteReview = async (rev) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই রিভিউটি মুছে ফেলতে চান?')) return;
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
              ⭐ আমার রিভিউ ও মতামত (My Reviews)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              আপনার প্রদানকৃত সমস্ত রেটিং ও রিভিউ তালিকা দেখুন এবং সম্পাদনা করুন।
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

        {/* Loading */}
        {loading && (
          <div className="py-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">রিভিউসমূহ লোড হচ্ছে...</p>
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
            <h3 className="text-xl font-bold text-gray-800 mt-3">এখনও কোনো রিভিউ দেওয়া হয়নি</h3>
            <p className="text-sm text-gray-500 mt-1">
              আপনার সম্পন্নকৃত বুকিংয়ের অভিজ্ঞতা থেকে রিভিউ প্রদান করুন।
            </p>
            <Link
              to="/customer/bookings"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition shadow"
            >
              আমার সম্পন্ন বুকিং দেখুন
            </Link>
          </div>
        )}

        {/* Reviews List */}
        {!loading && !error && reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <ReviewCard
                key={r._id}
                review={r}
                currentUserId={user?._id}
                isAdmin={false}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>
        )}

        {/* Edit Review Modal */}
        {editingReview && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">
                ✏️ রিভিউ সম্পাদনা করুন
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">রেটিং</label>
                <RatingInput rating={editRating} onChange={setEditRating} />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">মন্তব্য</label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows="3"
                  className="w-full p-2.5 border border-gray-300 rounded-xl text-xs"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleUpdateReview}
                  disabled={updating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow disabled:opacity-50"
                >
                  {updating ? 'আপডেট হচ্ছে...' : 'সংরক্ষণ করুন'}
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

export default CustomerReviews;
