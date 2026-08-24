import React from 'react';
import ReviewStatusBadge from './ReviewStatusBadge';
import RatingInput from './RatingInput';

const ReviewCard = ({
  review,
  currentUserId = null,
  isAdmin = false,
  onEdit = null,
  onDelete = null,
  onToggleStatus = null,
}) => {
  const isOwner = currentUserId && review.customer?.user?._id?.toString() === currentUserId.toString();
  const canEdit = isOwner || isAdmin;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3 transition hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            {review.customer?.fullName?.[0] || review.customer?.user?.name?.[0] || '👤'}
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              {review.customer?.fullName || review.customer?.user?.name || 'গ্রাহক'}
            </h4>
            <p className="text-[11px] text-gray-500">
              {new Date(review.createdAt).toLocaleDateString('bn-BD')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RatingInput rating={review.rating} readOnly />
          {(isAdmin || isOwner) && <ReviewStatusBadge status={review.status} />}
        </div>
      </div>

      {/* Target Info (Car / Driver / Booking) */}
      <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl flex flex-wrap items-center gap-x-4 gap-y-1">
        {review.car && (
          <span>🚗 গাড়ি: <strong className="text-gray-800">{review.car.name || review.car}</strong></span>
        )}
        {review.driver && (
          <span>👨‍✈️ ড্রাইভার: <strong className="text-gray-800">{review.driver.fullName || review.driver}</strong></span>
        )}
        {review.booking && (
          <span>📋 বুকিং: <strong className="text-gray-800">#{review.booking.bookingId || review.booking}</strong></span>
        )}
      </div>

      {/* Comment */}
      {review.comment ? (
        <p className="text-xs text-gray-700 leading-relaxed italic">
          "{review.comment}"
        </p>
      ) : (
        <p className="text-xs text-gray-400 italic">কোনো মন্তব্য করা হয়নি।</p>
      )}

      {/* Action Buttons */}
      {(canEdit || isAdmin) && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 text-xs">
          {isAdmin && onToggleStatus && (
            <button
              onClick={() => onToggleStatus(review)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                review.status === 'published'
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              {review.status === 'published' ? '👁️‍🗨️ গোপন করুন' : '✅ প্রকাশ করুন'}
            </button>
          )}

          {canEdit && onEdit && (
            <button
              onClick={() => onEdit(review)}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg transition"
            >
              ✏️ সম্পাদনা
            </button>
          )}

          {canEdit && onDelete && (
            <button
              onClick={() => onDelete(review)}
              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg transition"
            >
              🗑️ মুছুন
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
