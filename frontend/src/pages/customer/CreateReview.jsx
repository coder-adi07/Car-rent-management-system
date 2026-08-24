import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import RatingInput from '../../components/reviews/RatingInput';
import bookingService from '../../services/booking.service';
import reviewService from '../../services/review.service';
import { getImageUrl } from '../../utils/imageUrl';

const CreateReview = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingIdParam = searchParams.get('bookingId');

  const [booking, setBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);
  const [bookingError, setBookingError] = useState(null);

  // Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!bookingIdParam) {
      setBookingError('রিভিউ প্রদানের জন্য নির্দিষ্ট সম্পন্নকৃত বুকিং নির্বাচন করুন।');
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
          if (b.status !== 'completed') {
            setBookingError('কেবলমাত্র সম্পন্নকৃত (completed) বুকিং বা রেন্টাল চুক্তির জন্যই রিভিউ দেওয়া সম্ভব।');
          } else {
            setBooking(b);
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

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!booking) return;

    if (!rating || rating < 1 || rating > 5) {
      setErrorMsg('অনুগ্রহ করে ১ থেকে ৫ এর মধ্যে রেটিং নির্বাচন করুন।');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        bookingId: booking._id,
        car: booking.car?._id || booking.car,
        driver: booking.driver?._id || booking.driver || null,
        rating: Number(rating),
        comment: comment.trim() || null,
      };

      const res = await reviewService.createReview(payload);
      if (res.success && res.data?.review) {
        navigate('/customer/reviews', {
          state: { message: 'আপনার মূল্যবান রিভিউ সফলভাবে জমা হয়েছে!' },
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'রিভিউ জমা দিতে সমস্যা হয়েছে।');
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

        {/* Loading */}
        {loadingBooking && (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm text-gray-600 mt-4 font-medium">বুকিং বিবরণ যাচাই করা হচ্ছে...</p>
          </div>
        )}

        {/* Error */}
        {!loadingBooking && bookingError && (
          <div className="bg-white rounded-3xl border border-gray-200 p-8 text-center my-6 shadow-sm">
            <span className="text-4xl">⚠️</span>
            <h3 className="text-lg font-bold text-red-700 mt-3">রিভিউ দেওয়া সম্ভব নয়</h3>
            <p className="text-sm text-gray-600 mt-1">{bookingError}</p>
            <Link
              to="/customer/bookings"
              className="mt-5 inline-block px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl"
            >
              বুকিং তালিকায় ফিরে যান
            </Link>
          </div>
        )}

        {/* Create Review Form */}
        {!loadingBooking && !bookingError && booking && (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
                বুকিং আইডি: #{booking.bookingId}
              </span>
              <h1 className="text-2xl font-extrabold text-gray-900 mt-2">আপনার অভিজ্ঞতা শেয়ার করুন (Write Review)</h1>
              <p className="text-xs text-gray-500 mt-1">
                আপনার রেন্টাল সেবার অনুভূতি ব্যক্ত করুন। আপনার মতামত অন্যদের গাড়ি নির্বাচন করতে সাহায্য করবে।
              </p>
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 text-xs font-semibold flex items-center justify-between">
                <span>⚠️ {errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="font-bold">✖</button>
              </div>
            )}

            {/* Target Booking/Car summary */}
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white border border-emerald-200 overflow-hidden flex items-center justify-center text-3xl flex-shrink-0">
                {booking.car?.images && booking.car.images.length > 0 ? (
                  <img src={getImageUrl(booking.car.images[0])} alt="Car" className="w-full h-full object-cover" />
                ) : (
                  '🚗'
                )}
              </div>
              <div className="text-xs">
                <span className="font-bold text-gray-500 uppercase">{booking.car?.carType}</span>
                <h3 className="text-base font-bold text-gray-900">{booking.car?.name}</h3>
                <p className="text-gray-600">{booking.car?.brand} {booking.car?.model}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitReview} className="space-y-5 pt-2">
              {/* Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  আপনার রেটিং নির্বাচন করুন (Rating) <span className="text-red-500">*</span>
                </label>
                <RatingInput rating={rating} onChange={setRating} />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  আপনার মন্তব্য / অভিজ্ঞতা (Review Comment)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                  placeholder="গাড়ির কন্ডিশন, পরিচ্ছন্নতা এবং সার্বিক ড্রাইভিং অভিজ্ঞতা সম্পর্কে লিখুন..."
                  className="w-full p-3.5 border border-gray-300 rounded-2xl text-xs focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl transition shadow disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>রিভিউ জমা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <span>⭐ রিভিউ জমা দিন</span>
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

export default CreateReview;
