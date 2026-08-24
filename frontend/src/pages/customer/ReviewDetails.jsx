import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ReviewStatusBadge from '../../components/reviews/ReviewStatusBadge';
import RatingInput from '../../components/reviews/RatingInput';
import reviewService from '../../services/review.service';

const CustomerReviewDetails = () => {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReview = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reviewService.getReviewById(id);
      if (response.success && response.data?.review) {
        setReview(response.data.review);
      } else {
        setError('রিভিউ পাওয়া যায়নি।');
      }
    } catch (err) {
      setError(err.message || 'রিভিউ বিবরণ লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            to="/customer/reviews"
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1"
          >
            ← আমার রিভিউ তালিকায় ফিরে যান
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">রিভিউ বিবরণ লোড হচ্ছে...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center my-6 shadow-sm">
            <span className="text-4xl">❌</span>
            <h3 className="text-xl font-bold text-red-700 mt-3">রিভিউ পাওয়া যায়নি</h3>
            <p className="text-sm text-gray-600 mt-1">{error}</p>
            <Link
              to="/customer/reviews"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl"
            >
              রিভিউ তালিকায় ফিরে যান
            </Link>
          </div>
        )}

        {/* Details Content */}
        {!loading && !error && review && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">রিভিউ বিবরণ</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  তারিখ: {new Date(review.createdAt).toLocaleString('bn-BD')}
                </p>
              </div>

              <ReviewStatusBadge status={review.status} />
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-600 block mb-1">রেটিং প্রদান</span>
                <RatingInput rating={review.rating} readOnly />
              </div>
            </div>

            {/* Car & Booking info */}
            {review.car && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1">
                <span className="font-bold text-gray-700 block">🚗 গাড়ি সম্পর্কিত তথ্য:</span>
                <p className="text-sm font-bold text-gray-900">{review.car.name}</p>
                <p className="text-gray-600">{review.car.brand} {review.car.model}</p>
              </div>
            )}

            {/* Comment */}
            <div>
              <span className="text-xs font-bold text-gray-700 block mb-1">আপনার মন্তব্য:</span>
              <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-800 leading-relaxed italic">
                {review.comment ? `"${review.comment}"` : 'কোনো মন্তব্য করা হয়নি।'}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CustomerReviewDetails;
